// npm run kb:reindex - rebuilds the chunks (and their embeddings) of every non-retired knowledge document.
// Run it after setting GEMINI_API_KEY, after changing GEMINI_EMBED_MODEL, or when documents were added while
// the embedding service was unreachable (those documents are searched by keyword only until reindexed).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const connectDB = require('../config/db');

(async () => {
  const conn = await connectDB();
  if (!conn) process.exit(1);
  const { KnowledgeDocument, KnowledgeChunk } = require('../modules/assistant/model');
  const rag = require('../modules/assistant/rag');
  const llm = require('../modules/assistant/llm');
  if (!llm.available()) console.warn('GEMINI_API_KEY is not set: chunks will be rebuilt WITHOUT embeddings (keyword search only).');

  const docs = await KnowledgeDocument.find({ status: { $ne: 'retired' } });
  let chunks = 0;
  for (const d of docs) chunks += await rag.rechunk(d);
  const embedded = await KnowledgeChunk.countDocuments({ status: { $ne: 'retired' }, embeddingModel: { $exists: true } });
  console.log(`Reindexed ${docs.length} document(s) into ${chunks} chunk(s); ${embedded} chunk(s) have embeddings (${llm.describe().embedding}).`);
  process.exit(0);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
