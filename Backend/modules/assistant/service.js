/**
 * Assistant orchestration: role agent + RAG + LLM tool-calling.
 *
 *   identity  -> comes from the verified login (req.user / req.access), never from the request body
 *   agent     -> chosen from the user's roles (agents.js)
 *   knowledge -> retrieved for the user's roles only (rag.js) and put in the prompt
 *   tools     -> only those the user's permissions allow, run through the normal services (tools.js)
 *   LLM       -> Gemini (llm.js). If it is not configured or fails, the rule-based path answers from the same tools
 *                and knowledge, so the assistant degrades instead of breaking.
 */
const { AssistantConversation } = require('./model');
const { resolveAgent } = require('./agents');
const { TOOLS, byName, allowedFor, execute } = require('./tools');
const rag = require('./rag');
const llm = require('./llm');
const audit = require('../../core/audit');
const logger = require('../../core/logger');
const { notFound } = require('../../core/http');

const MAX_ROUNDS = 4;
const HISTORY_TURNS = 10;
const REGULATORY = /\b(rule|rules|requirement|requirements|regulation|regulations|policy|policies|minimum|maximum|fee|fees|criteria|procedure|process|how (do|does|to|can)|eligib\w*|allowed|deadline)\b/i;

const SEARCH_TOOL = {
  name: 'search_knowledge',
  description: 'Search the SEUSL Faculty of Technology regulations, forms guidance and workflow documents that this user is allowed to read.',
  parameters: { type: 'object', properties: { query: { type: 'string', description: 'What to look up' } }, required: ['query'] },
};

const declaration = (t) => ({ name: t.name, description: t.description, parameters: t.parameters });

const knowledgeBlock = (hits) =>
  hits.length
    ? hits.map((h, i) => `[${i + 1}] ${h.title} (source: ${h.source})${h.status === 'needs_confirmation' ? ' [UNCONFIRMED - not yet verified against the Faculty Handbook]' : ''}\n${h.text}`).join('\n\n')
    : '(nothing relevant found in the knowledge base for this question)';

const buildSystem = (agent, person, hits) => `You are ${agent.name}, an intelligent academic assistant for the Faculty of Technology, South Eastern University of Sri Lanka (SEUSL).
You are talking to ${person.name}, role: ${agent.roleLabel}${person.department ? `, department: ${person.department}` : ''}. Today is ${new Date().toISOString().slice(0, 10)}.
Your focus: ${agent.focus}.

Instructions:
- Synthesize all retrieved knowledge into natural, helpful, professional, and well-structured responses.
- NEVER dump raw page headers, pagination banners (e.g. "-- 7 of 157 --"), repeated text fragments, or raw OCR chunks.
- When the user asks about academic courses, modules, or subjects for a specific year or semester (e.g. "2nd year 1st semester" or "year 1 sem 2"), call the curriculum_subjects tool to get the official curriculum and present all course codes, titles, credits, lecture/practical hours, and lecturers in a clean Markdown table.
- When asked about faculty officers, lecturers, or staff (e.g. Dean, HOD, Mr. RKA. Rifai Kariapper), politely summarize their title, department, qualifications, and role at SEUSL based on the retrieved knowledge.
- If the question asks for institutional procedures (repeat exams, medical forms, attendance, grading), explain the requirements and steps clearly.
- If retrieved knowledge contains [UNCONFIRMED], note that the guideline is pending handbook verification.
- Be concise, friendly, and format structured information, course lists, and timetables using clean Markdown tables and bullet points (ChatGPT and Gemini style).

Retrieved knowledge:
${knowledgeBlock(hits)}`;

/* --------------------------------- LLM agent --------------------------------- */
const publicError = (err) => (err && (err.code === 'NOT_A_STUDENT' || err.status) ? err.message : 'The information could not be retrieved.');

/**
 * Fast models answer short knowledge questions; the stronger tier is used when the question needs the user's data
 * (a tool keyword matches), is long, asks several things at once, or asks for reasoning (compare, calculate ...).
 */
const COMPLEX = /\b(compare|summari[sz]e|explain why|calculate|difference|step by step|list all|breakdown|analy[sz]e)\b/i;
const chooseTier = (message, tools) => {
  const lower = message.toLowerCase();
  const isMultiQuestion = /\?[^?]+\?/.test(message);
  if (message.length > 160 || isMultiQuestion || COMPLEX.test(message)) return 'smart';
  return tools.some((t) => t.keywords.some((k) => lower.includes(k))) ? 'smart' : 'fast';
};

/** Documents worth showing as sources: those close in relevance to the best match (the rest were only prompt context). */
const relevantSources = (hits) => {
  if (!hits.length) return [];
  const top = hits[0].score || 0;
  return hits.filter((h, i) => i === 0 || h.score >= 0.6 * top).slice(0, 3);
};

const agentLoop = async ({ req, agent, person, tools, history, message, hits, tier: startTier }) => {
  const allowed = new Map(tools.map((t) => [t.name, t]));
  const used = new Set();
  const sources = new Map(relevantSources(hits).map((h) => [h.title, h]));
  const messages = [...history.map((m) => (m.role === 'user' ? { role: 'user', text: m.content } : { role: 'assistant', text: m.content })), { role: 'user', text: message }];
  const declarations = [SEARCH_TOOL, ...tools.map(declaration)];
  const cache = new Map(); // identical tool calls within one turn are answered once
  let model = null;
  let tier = startTier;

  const runCall = async (call) => {
    if (call.name === 'search_knowledge') {
      const found = await rag.retrieve(agent.roles, String((call.args && call.args.query) || ''), { k: 4 });
      relevantSources(found).forEach((h) => sources.set(h.title, h));
      used.add('search_knowledge');
      return found.map((h) => ({ title: h.title, source: h.source, unconfirmed: h.status === 'needs_confirmation', text: h.text }));
    }
    const tool = allowed.get(call.name);
    if (!tool) return { error: "This information is not available for the current user's role." }; // enforced here, not in the prompt
    try {
      used.add(tool.name);
      return await execute(tool, req, call.args);
    } catch (err) {
      logger.warn('Assistant tool failed', { tool: tool.name, error: err.message });
      return { error: publicError(err) };
    }
  };

  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    // on the last round tools are switched off so the model has to answer with what it already has
    const out = await llm.generate({ system: buildSystem(agent, person, hits), messages, tools: declarations, tier, final: round === MAX_ROUNDS - 1 });
    model = out.model || model;
    tier = out.tier || tier;
    if (!out.toolCalls || !out.toolCalls.length) {
      if (!out.text) throw new Error('Empty model answer');
      return { text: out.text, used: [...used], sources: [...sources.values()], model, tier };
    }
    tier = 'smart'; // the model is now working with the user's data: use the stronger tier for the rest of the turn
    messages.push({ role: 'assistant', text: out.text, toolCalls: out.toolCalls });
    const results = await Promise.all(
      out.toolCalls.map(async (call) => {
        const key = `${call.name}:${JSON.stringify(call.args || {})}`;
        if (!cache.has(key)) cache.set(key, runCall(call));
        return { name: call.name, result: await cache.get(key) };
      })
    );
    messages.push({ role: 'tool', results });
  }
  throw new Error('The model did not finish within the allowed tool rounds');
};

/* ------------------------------ rule-based fallback ------------------------------ */
const capabilityList = (agent, tools) => `${tools.slice(0, 6).map((t) => `- ${t.description.split('.')[0]}`).join('\n')}\n- Faculty regulations, forms and workflow guidance for your role`;

const UNCONFIRMED_NOTE = '\n\n_Note: not yet confirmed against the Faculty Handbook._';
const withNote = (h) => `${h.text}${h.status === 'needs_confirmation' ? UNCONFIRMED_NOTE : ''}`;

const rulesAnswer = async ({ req, agent, tools, message, hits }) => {
  const lower = message.toLowerCase();
  const used = [];
  const parts = [];
  const hit = (t) => t.keywords.filter((k) => lower.includes(k)).reduce((n, k) => Math.max(n, k.length), 0);

  let matched = tools.map((t) => ({ t, w: hit(t) })).filter((x) => x.w).sort((a, b) => b.w - a.w).slice(0, 3).map((x) => x.t);

  // If question is asking about curriculum/subjects/courses, ensure curriculum_subjects tool is invoked
  if (!matched.some((t) => t.name === 'curriculum_subjects')) {
    const isSubjectQuery = /\b(subject|subjects|course|courses|curriculum|module|modules|syllabus)\b/i.test(message) ||
      /\b(?:1yaer|2yaer|3yaer|4yaer|1st\s*year|2nd\s*year|3rd\s*year|4th\s*year|year\s*[1-4])\b/i.test(message);
    const currTool = tools.find((t) => t.name === 'curriculum_subjects');
    if (isSubjectQuery && currTool) {
      matched = [currTool, ...matched.filter((t) => t.name !== 'curriculum_subjects')];
    }
  }

  const blocked = TOOLS.filter((t) => !tools.includes(t) && hit(t));

  for (const t of matched) {
    try {
      const data = await execute(t, req, { query: message });
      parts.push(t.format(data));
      used.push(t.name);
    } catch (err) {
      parts.push(`I could not retrieve that right now (${publicError(err)}).`);
    }
  }

  // Filter out any table of contents hits so dots and page numbers are never shown
  const isTocHit = (h) => (h.text.match(/\.{3,}|\. \. \./g) || []).length >= 2;
  const cleanHits = hits.filter((h) => !isTocHit(h));

  let sources = [];
  if (matched.length && cleanHits.length && REGULATORY.test(message)) {
    // a data tool matched, but the question also asks for the rule behind it: add the retrieved regulation
    sources = relevantSources(cleanHits).slice(0, 2);
    parts.push(...sources.map(withNote));
  }
  if (!matched.length) {
    if (blocked.length && !(REGULATORY.test(message) && cleanHits.length)) {
      parts.push(`That information is not available to your role (**${agent.roleLabel}**). Please contact the office that holds it, or ask me about:\n${capabilityList(agent, tools)}`);
    } else if (cleanHits.length) {
      sources = relevantSources(cleanHits).slice(0, 2);
      const cleaned = sources.map((h) => {
        const text = String(h.text || '')
          .replace(/^--\s*\d+\s*of\s*\d+\s*--\s*/gim, '')
          .replace(/^page\s*\d+(\s*of\s*\d+)?\s*/gim, '')
          .trim();
        return `${text}${h.status === 'needs_confirmation' ? UNCONFIRMED_NOTE : ''}`;
      }).filter((t) => t.length > 20);
      if (cleaned.length) {
        parts.push(cleaned.join('\n\n'));
      } else {
        parts.push(`I can help with:\n${capabilityList(agent, tools)}\n\nTry: “${agent.starters[0]}”`);
      }
    } else {
      parts.push(`I can help with:\n${capabilityList(agent, tools)}\n\nTry: “${agent.starters[0]}”`);
    }
  }
  return { text: parts.join('\n\n'), used, sources, model: null };
};

/* ------------------------------------ chat ------------------------------------ */
const personOf = (req) => ({ name: req.user.name || req.user.email, department: req.user.department || '' });

const loadConversation = async (req, agentKey, conversationId) => {
  if (!conversationId) return new AssistantConversation({ user: req.user.id, agent: agentKey, messages: [] });
  const doc = await AssistantConversation.findOne({ _id: conversationId, user: req.user.id }); // only ever the caller's own
  if (!doc) throw notFound('Conversation not found.');
  return doc;
};

const chat = async (req, { message, conversationId }) => {
  const agent = resolveAgent(req.access);
  const tools = allowedFor(req.access);
  const conversation = await loadConversation(req, agent.key, conversationId);

  // Fast-path for conversational greetings
  const trimmed = String(message || '').trim();
  const GREETINGS = /^(hi|hii|hiii|hello|hey|heyy|greetings|good\s*(morning|afternoon|evening|day)|assalamu\s*alaikum|salam|ayubowan|vanakkam)[\s!.,?]*$/i;
  if (GREETINGS.test(trimmed)) {
    const greetingText = `Hello! 👋 I am your **SEUConnect AI Assistant** for the Faculty of Technology, South Eastern University of Sri Lanka.\n\nI am here to assist you with:\n- 📚 **Official Handbook Curriculum & Subjects** (e.g. *"what subjects are in 2nd year 1st semester?"*)\n- 📋 **Faculty Form Workflows** (Repeat CA / ECA, Repeat ESA, Medical Concessions)\n- 🏛️ **Faculty Staff & Officers** (Dean, HODs, Course Coordinators)\n- 📊 **Academic Regulations** (80% Attendance rule, GPA & degree classes)\n\nWhat would you like to know today?`;
    conversation.messages.push({ role: 'user', content: message }, { role: 'assistant', content: greetingText, tools: [], sources: [], mode: 'direct' });
    await conversation.save();
    return {
      conversationId: String(conversation._id),
      answer: greetingText,
      mode: 'direct',
      model: null,
      tier: null,
      agent: { key: agent.key, name: agent.name, role: agent.roleLabel },
      toolsUsed: [],
      sources: [],
    };
  }

  const history = conversation.messages.slice(-HISTORY_TURNS);
  const hits = await rag.retrieve(agent.roles, message, { k: 4 });

  let out;
  let mode = 'rules';
  if (llm.available()) {
    try {
      out = await agentLoop({ req, agent, person: personOf(req), tools, history, message, hits, tier: chooseTier(message, tools) });
      mode = 'llm';
    } catch (err) {
      logger.warn('LLM answer failed; using rule-based answer', { error: err.message });
    }
  }
  if (!out) out = await rulesAnswer({ req, agent, tools, message, hits });

  const sourceTitles = [...new Set(out.sources.map((s) => s.title))];
  conversation.messages.push({ role: 'user', content: message }, { role: 'assistant', content: out.text, tools: out.used, sources: sourceTitles, mode });
  if (conversation.messages.length > 40) conversation.messages = conversation.messages.slice(-40);
  await conversation.save();
  try {
    await audit.record({ req, action: 'assistant.chat', entityType: 'AssistantConversation', entityId: conversation._id, after: { agent: agent.key, tools: out.used, mode } }); // metadata only, never the message text
  } catch (err) {
    logger.warn('Assistant audit write failed', { error: err.message });
  }

  return {
    conversationId: String(conversation._id),
    answer: out.text,
    mode,
    model: out.model,
    tier: out.tier || null,
    agent: { key: agent.key, name: agent.name, role: agent.roleLabel },
    toolsUsed: out.used,
    sources: out.sources.map((s) => ({ title: s.title, source: s.source, unconfirmed: s.status === 'needs_confirmation' })),
  };
};

const describeAgent = (req) => {
  const agent = resolveAgent(req.access);
  return {
    key: agent.key, name: agent.name, role: agent.roleLabel, focus: agent.focus, starters: agent.starters,
    capabilities: allowedFor(req.access).map((t) => ({ name: t.name, description: t.description })),
    llm: llm.available(),
    models: llm.available() ? llm.describe() : null,
  };
};

const getHistory = async (req, conversationId) => {
  const doc = await AssistantConversation.findOne({ _id: conversationId, user: req.user.id }).lean();
  if (!doc) throw notFound('Conversation not found.');
  return { conversationId: String(doc._id), messages: doc.messages };
};

module.exports = { chat, describeAgent, getHistory, chooseTier, rulesAnswer };
