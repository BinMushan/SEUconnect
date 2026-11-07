/**
 * Retrieval-augmented generation over the role-aware knowledge base.
 *
 *  ingest  : split a document into chunks, embed them (when an embedding model is available) and store them
 *  retrieve: hybrid ranking = BM25 keyword score + cosine similarity of embeddings, restricted to the caller's roles
 *
 * Keyword retrieval works with no external service, so the assistant still answers from the knowledge base when
 * the LLM / embedding API is down. Embeddings are brute-force compared in memory (a few thousand chunks is fine);
 * move to Atlas Vector Search if the knowledge base grows beyond that.
 */
const { KnowledgeDocument, KnowledgeChunk } = require('./model');
const llm = require('./llm');

const MAX_CHUNK = 900; // characters
const MAX_CANDIDATES = 3000;
const MIN_LEXICAL = 0.12; // normalised BM25 below this is treated as "no match"
const MIN_COSINE = 0.55;
const MIN_COVERAGE = 0.18; // share of the question's distinct terms a chunk must contain

const STOP = new Set('a an and are as at be by can do does for from has have how i if in is it me my of on or our so than that the their them then there these they this to was we what when where which who why will with would you your'.split(' '));

const stem = (w) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const tokenize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9%.\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^\.+|\.+$/g, ''))
    .filter((w) => w && !STOP.has(w))
    .map(stem);

/** Normalizes common student typos, abbreviations and expands curriculum synonyms for retrieval */
const expandQuery = (text) => {
  let expanded = String(text || '');
  expanded = expanded
    .replace(/\b1yaer\b|\b1\s*yaer\b/gi, 'year 1 first year')
    .replace(/\b2yaer\b|\b2\s*yaer\b/gi, 'year 2 second year')
    .replace(/\b3yaer\b|\b3\s*yaer\b/gi, 'year 3 third year')
    .replace(/\b4yaer\b|\b4\s*yaer\b/gi, 'year 4 fourth year')
    .replace(/\b1st\s*year\b/gi, 'year 1 first year')
    .replace(/\b2nd\s*year\b/gi, 'year 2 second year')
    .replace(/\b3rd\s*year\b/gi, 'year 3 third year')
    .replace(/\b4th\s*year\b/gi, 'year 4 fourth year')
    .replace(/\b1st\s*sem(ester)?\b/gi, 'semester 1 semester i first semester')
    .replace(/\b2nd\s*sem(ester)?\b/gi, 'semester 2 semester ii second semester')
    .replace(/\bsem(ester)?\s*1\b/gi, 'semester 1 semester i first semester')
    .replace(/\bsem(ester)?\s*2\b/gi, 'semester 2 semester ii second semester');
  return expanded;
};

/** Identifies table-of-contents chunks (lines of dots and page numbers) so they do not dominate query answers */
const isTableOfContents = (text) => {
  const dotCount = (text.match(/\.{3,}|\. \. \./g) || []).length;
  const pageMatches = (text.match(/\.{2,}\s*\d+/g) || []).length;
  return dotCount >= 2 || pageMatches >= 2;
};

/** Splits on blank lines / headings and packs paragraphs up to MAX_CHUNK characters; never cuts a sentence in half. */
const chunkText = (content) => {
  const paragraphs = String(content).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  const push = () => {
    if (current.trim()) chunks.push(current.trim());
    current = '';
  };
  for (const p of paragraphs) {
    if (p.length > MAX_CHUNK) {
      push();
      // Try sentence splitting first
      const sentences = p.split(/(?<=[.!?])\s+/);
      if (sentences.length > 1) {
        let buf = '';
        for (const sentence of sentences) {
          if (buf && (buf + ' ' + sentence).length > MAX_CHUNK) {
            chunks.push(buf.trim());
            buf = '';
          }
          buf += (buf ? ' ' : '') + sentence;
        }
        if (buf.trim()) chunks.push(buf.trim());
      } else {
        // Fallback for tables or unpunctuated lists: split by line breaks
        const lines = p.split(/\r?\n+/);
        let buf = '';
        for (const line of lines) {
          if (buf && (buf + '\n' + line).length > MAX_CHUNK) {
            if (buf.trim()) chunks.push(buf.trim());
            buf = '';
          }
          buf += (buf ? '\n' : '') + line;
        }
        if (buf.trim()) chunks.push(buf.trim());
      }
    } else if (current && (current + '\n\n' + p).length > MAX_CHUNK) {
      push();
      current = p;
    } else {
      current += (current ? '\n\n' : '') + p;
    }
  }
  push();
  return chunks;
};

const writeChunks = async (doc) => {
  await KnowledgeChunk.deleteMany({ document: doc._id });
  const parts = chunkText(doc.content);
  // Embed up to 250 chunks in batches to ensure comprehensive semantic coverage across handbook chapters
  const MAX_EMBED = 250;
  const syncParts = parts.slice(0, MAX_EMBED);
  let embedded = null;
  try {
    embedded = await llm.embed(syncParts.map((t) => `${doc.title}\n${t}`));
  } catch (err) {
    // If embedding API is unreachable, continue cleanly with keyword search
  }
  await KnowledgeChunk.insertMany(
    parts.map((text, i) => ({
      document: doc._id, title: doc.title, source: doc.source, category: doc.category, audience: doc.audience,
      status: doc.status, ord: i, text,
      ...(embedded && embedded.vectors && embedded.vectors[i] ? { embedding: embedded.vectors[i], embeddingModel: embedded.model } : {}),
    }))
  );
  doc.chunksCount = parts.length;
  await doc.save();
  return parts.length;
};

/** Creates or replaces a document and its chunks. */
const ingest = async ({ title, source, category, audience = [], status = 'active', content, seedKey, createdBy = null, fileName = null, fileSize = null }) => {
  let doc = seedKey ? await KnowledgeDocument.findOne({ seedKey }) : null;
  if (doc) {
    // built-in documents are refreshed only when their text changed, so a retired/edited copy is never resurrected silently
    if (doc.content === content && doc.title === title && doc.source === source && String(doc.audience) === String(audience) && doc.status === status) return { document: doc, chunks: doc.chunksCount || 0, unchanged: true };
    Object.assign(doc, { title, source, category, audience, status, content, version: doc.version + 1, retiredAt: null, ...(fileName ? { fileName } : {}), ...(fileSize ? { fileSize } : {}) });
  } else {
    doc = new KnowledgeDocument({ title, source, category, audience, status, content, seedKey, createdBy, ...(fileName ? { fileName } : {}), ...(fileSize ? { fileSize } : {}) });
  }
  await doc.save();
  const chunks = await writeChunks(doc);
  return { document: doc, chunks, unchanged: false };
};

const retire = async (id) => {
  const doc = await KnowledgeDocument.findById(id);
  if (!doc) return null;
  doc.status = 'retired';
  doc.retiredAt = new Date();
  await doc.save();
  await KnowledgeChunk.updateMany({ document: doc._id }, { status: 'retired' });
  return doc;
};

const cosine = (a, b) => {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
};

/** Roles that may read everything in the knowledge base. */
const SEES_ALL = ['admin', 'superadmin'];

const audienceFilter = (roles) => (roles.some((r) => SEES_ALL.includes(r)) ? {} : { $or: [{ audience: { $size: 0 } }, { audience: { $in: roles } }] });

/**
 * Returns up to k chunks [{ title, source, status, text, score }] the given roles are allowed to read.
 * `status: needs_confirmation` chunks are returned too, flagged, so the answer can say the rule is unconfirmed.
 */
const retrieve = async (roles, query, { k = 6 } = {}) => {
  const baseTokens = tokenize(query);
  const expandedTokens = tokenize(expandQuery(query));
  const qTokens = [...new Set([...baseTokens, ...expandedTokens])];
  if (!qTokens.length) return [];
  const queryIsToc = /\b(table of contents|contents|index|toc)\b/i.test(query);
  const filter = { status: { $in: ['active', 'needs_confirmation'] }, ...audienceFilter(roles) };
  const chunks = await KnowledgeChunk.find(filter).select('+embedding').limit(MAX_CANDIDATES).lean();
  if (!chunks.length) return [];

  // BM25
  const docsTokens = chunks.map((c) => tokenize(`${c.title} ${c.title} ${c.text}`));
  const avgLen = docsTokens.reduce((s, t) => s + t.length, 0) / docsTokens.length || 1;
  const df = new Map();
  for (const t of new Set(qTokens)) df.set(t, docsTokens.filter((d) => d.includes(t)).length);
  const N = chunks.length;
  const k1 = 1.4;
  const b = 0.75;
  const uniqueQ = [...new Set(qTokens)];
  const coverage = docsTokens.map((tokens) => uniqueQ.filter((t) => tokens.includes(t)).length / uniqueQ.length);
  const raw = docsTokens.map((tokens) => {
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    let score = 0;
    for (const t of new Set(qTokens)) {
      const f = tf.get(t) || 0;
      if (!f) continue;
      const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
      score += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * tokens.length) / avgLen));
    }
    return score;
  });
  const maxRaw = Math.max(...raw, 0);

  // embeddings (only chunks embedded with the same model as the query can be compared)
  let sims = null;
  if (chunks.some((c) => c.embedding && c.embedding.length)) {
    const q = await llm.embed([query], { query: true });
    if (q) sims = chunks.map((c) => (c.embeddingModel === q.model && c.embedding ? cosine(q.vectors[0], c.embedding) : 0));
  }

  const ranked = chunks
    .map((c, i) => {
      const isToc = isTableOfContents(c.text);
      const lex = maxRaw ? raw[i] / maxRaw : 0;
      const sim = sims && sims[i] != null ? sims[i] : 0;
      const hasSim = Boolean(sims && c.embedding && c.embedding.length);
      let score = hasSim ? (0.45 * lex + 0.55 * sim) : lex;
      if (isToc && !queryIsToc) {
        score *= 0.1; // heavily deprioritize table of contents
      }
      const matches = (!isToc || queryIsToc) && (
        (maxRaw > 0 && lex >= MIN_LEXICAL && raw[i] > 0 && (coverage[i] >= MIN_COVERAGE || lex >= 0.25)) ||
        (hasSim && sim >= MIN_COSINE)
      );
      return { c, matches, score: sims ? (hasSim ? 0.45 * lex + 0.55 * sim : lex) : lex };
    })
    .filter((x) => x.matches)
    .sort((a, z) => z.score - a.score)
    .slice(0, k);

  return ranked.map(({ c, score }) => ({ title: c.title, source: c.source, status: c.status, text: c.text, score: Number(score.toFixed(3)) }));
};

module.exports = { ingest, rechunk: writeChunks, retire, retrieve, chunkText, tokenize, cosine };
