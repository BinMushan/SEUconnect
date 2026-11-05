/**
 * LLM access for the assistant. The API key lives ONLY here on the server (GEMINI_API_KEY); the browser never sees it.
 *
 * Multi-model: two tiers, each an ordered fallback list.
 *   fast  - small, low-latency models for short knowledge questions
 *   smart - stronger models for questions that need data tools, several steps or longer reasoning
 * A request tries its own tier first, then the other tier, so one model being slow, over quota or retired never
 * breaks the assistant. A model that fails is put on a short cooldown (longer for "gone"/"no quota" errors) so the
 * next requests skip it instead of waiting for another timeout.
 * Models are chosen from what the project's key can actually call (see GEMINI_MODELS_FAST / GEMINI_MODELS_SMART).
 *
 * Provider-neutral message format used by the agent loop:
 *   { role: 'user', text }
 *   { role: 'assistant', text?, toolCalls?: [{ name, args }] }
 *   { role: 'tool', results: [{ name, result }] }
 * generate({ system, messages, tools, tier }) -> { text, toolCalls, model, tier }   (tools: [{ name, description, parameters }])
 */
const logger = require('../../core/logger');

const API = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 15000);
const BUDGET_MS = Number(process.env.LLM_BUDGET_MS || 30000); // total time one answer may spend across fallbacks

// automated tests never reach the real API (they inject a provider with setProvider instead)
const apiKey = () => (process.env.NODE_ENV === 'test' ? '' : process.env.GEMINI_API_KEY || '');
const list = (value, fallback) => (value || fallback).split(',').map((m) => m.trim()).filter(Boolean);
const tiers = () => ({
  fast: list(process.env.GEMINI_MODELS_FAST, 'gemini-3.1-flash-lite,gemini-flash-lite-latest,gemini-3.5-flash-lite'),
  smart: list(process.env.GEMINI_MODELS_SMART, 'gemini-3.5-flash,gemini-3.6-flash,gemini-3-flash-preview'),
});
const embedModel = () => process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001';
const EMBED_DIMENSIONS = 256;

/** Models to try for a tier: its own list first, then the other tier's. */
const chainFor = (tier) => {
  const t = tiers();
  const [first, second] = tier === 'smart' ? [t.smart, t.fast] : [t.fast, t.smart];
  return [...new Set([...first, ...second])];
};

let override = null; // tests (or another provider) can replace the LLM: { generate, embed? }
const setProvider = (provider) => {
  override = provider;
};

const available = () => Boolean(override || apiKey());
const describe = () => ({ ...tiers(), embedding: embedModel() });

class LlmError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/* ------------------------------ model cooldowns ------------------------------ */
const downUntil = new Map(); // model -> timestamp
const cooldownFor = (err) => {
  if (err.status === 400) return 0; // the request itself was rejected, which says nothing about the model
  if (err.status === 404 || err.status === 403) return 10 * 60 * 1000; // retired / not allowed for this key
  if (err.status === 429) return 2 * 60 * 1000; // quota
  return 60 * 1000; // timeout, 5xx, network
};
const markDown = (model, err) => downUntil.set(model, Date.now() + cooldownFor(err));
const isDown = (model) => (downUntil.get(model) || 0) > Date.now();
const resetCooldowns = () => downUntil.clear();

const post = async (url, body, timeout = TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new LlmError(`HTTP ${res.status} ${detail.replace(/\s+/g, ' ').slice(0, 240)}`.trim(), res.status);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof LlmError) throw err;
    throw new LlmError(err.name === 'AbortError' ? 'timeout' : err.message, 0);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Walks `models` in order, skipping ones on cooldown, until one answers. `call(model)` does the request.
 * Returns { model, value }. Exported for tests (the HTTP call is injected).
 */
const runChain = async (models, call, { budgetMs = BUDGET_MS, now = Date.now } = {}) => {
  const started = now();
  let lastError = null;
  const candidates = models.filter((m) => !isDown(m));
  for (const model of candidates.length ? candidates : models) { // everything cooling down: try anyway rather than fail outright
    if (now() - started > budgetMs) break;
    try {
      const value = await call(model);
      return { model, value };
    } catch (err) {
      lastError = err;
      markDown(model, err);
      logger.warn('LLM model failed', { model, error: err.message });
    }
  }
  throw lastError || new LlmError('No model available');
};

/* ------------------------------- chat / agent ------------------------------- */
const toGemini = (messages) =>
  messages.map((m) => {
    if (m.role === 'user') return { role: 'user', parts: [{ text: m.text }] };
    if (m.role === 'tool') return { role: 'user', parts: m.results.map((r) => ({ functionResponse: { name: r.name, response: { result: r.result } } })) };
    const parts = [];
    if (m.text) parts.push({ text: m.text });
    // Gemini 3 models reject the next turn (HTTP 400) unless each functionCall comes back with its thoughtSignature
    for (const c of m.toolCalls || []) parts.push({ functionCall: { name: c.name, args: c.args || {} }, ...(c.signature ? { thoughtSignature: c.signature } : {}) });
    return { role: 'model', parts };
  });

const parseAnswer = (data) => {
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
  const text = parts.filter((p) => p.text).map((p) => p.text).join('').trim();
  const toolCalls = parts.filter((p) => p.functionCall).map((p) => ({ name: p.functionCall.name, args: p.functionCall.args || {}, signature: p.thoughtSignature || p.thought_signature || undefined }));
  if (!text && !toolCalls.length) throw new LlmError('Empty response', 0);
  return { text, toolCalls };
};

const generateGemini = async ({ system, messages, tools, tier = 'fast', final = false }) => {
  const body = {
    contents: toGemini(messages),
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: { temperature: 0.3, topP: 0.9, maxOutputTokens: 1200 },
  };
  if (tools && tools.length) {
    body.tools = [{ functionDeclarations: tools.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters })) }];
    if (final) body.toolConfig = { functionCallingConfig: { mode: 'NONE' } }; // last round: answer in text, no more tool calls
  }
  const { model, value } = await runChain(chainFor(tier), async (m) => parseAnswer(await post(`${API}/${m}:generateContent`, body)));
  return { ...value, model, tier: tiers()[tier] && tiers()[tier].includes(model) ? tier : tier === 'smart' ? 'fast' : 'smart' };
};

const generate = async (input) => {
  if (override) return override.generate(input);
  if (!apiKey()) throw new LlmError('No LLM configured', 0);
  return generateGemini(input);
};

/* --------------------------------- embeddings --------------------------------- */
/** Returns { model, vectors } or null when embeddings are unavailable (retrieval then falls back to keyword search). */
const embed = async (texts, { query = false } = {}) => {
  if (!texts.length) return { model: 'none', vectors: [] };
  if (override) return override.embed ? override.embed(texts, { query }) : null;
  if (!apiKey()) return null;
  try {
    const model = embedModel();
    const BATCH_SIZE = 50;
    const allVectors = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const slice = texts.slice(i, i + BATCH_SIZE);
      const data = await post(`${API}/${model}:batchEmbedContents`, {
        requests: slice.map((text) => ({
          model: `models/${model}`,
          content: { parts: [{ text: String(text).slice(0, 8000) }] },
          taskType: query ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT',
          outputDimensionality: EMBED_DIMENSIONS,
        })),
      });
      const vectors = (data.embeddings || []).map((e) => e.values);
      if (vectors.length !== slice.length || vectors.some((v) => !Array.isArray(v) || !v.length)) return null;
      allVectors.push(...vectors);
    }
    return { model: `${model}/${EMBED_DIMENSIONS}`, vectors: allVectors };
  } catch (err) {
    logger.warn('Embedding request failed; using keyword retrieval', { error: err.message });
    return null;
  }
};

module.exports = { available, generate, embed, setProvider, describe, chainFor, runChain, resetCooldowns, isDown, LlmError, toGemini, parseAnswer };
