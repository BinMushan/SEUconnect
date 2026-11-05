/**
 * npm run backup [-- --collections users,students --out ./some/dir]
 *
 * Portable NDJSON export (one JSON document per line, EJSON so ObjectIds/dates round-trip).
 * NOTE: MongoDB Atlas cloud backups / continuous backup are the PRIMARY backup strategy - enable them on the
 * cluster. This export is a convenience copy to take before migrations or large allocation / result runs.
 *
 * Secrets are never exported: password hashes, token hashes and refresh tokens are removed.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const EXCLUDED_COLLECTIONS = ['refreshtokens', 'migrations'];
const SECRET_FIELDS = ['password', 'passwordHash', 'tokenHash', 'refreshToken'];

const strip = (doc) => {
  for (const f of SECRET_FIELDS) delete doc[f];
  return doc;
};

const runBackup = async ({ outDir, collections } = {}) => {
  if (mongoose.connection.readyState !== 1) throw new Error('Not connected to MongoDB.');
  const { EJSON } = mongoose.mongo.BSON;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = outDir || path.join(__dirname, '..', 'backups', stamp);
  fs.mkdirSync(dir, { recursive: true });

  const all = (await mongoose.connection.db.listCollections().toArray()).map((c) => c.name).filter((n) => !n.startsWith('system.'));
  const wanted = collections && collections.length ? all.filter((n) => collections.includes(n)) : all;
  const summary = {};
  for (const name of wanted) {
    if (EXCLUDED_COLLECTIONS.includes(name)) {
      summary[name] = 'skipped (secret / bookkeeping)';
      continue;
    }
    const out = fs.createWriteStream(path.join(dir, `${name}.ndjson`), { mode: 0o600 });
    let count = 0;
    for await (const doc of mongoose.connection.db.collection(name).find({})) {
      out.write(`${EJSON.stringify(strip(doc), { relaxed: false })}\n`);
      count += 1;
    }
    await new Promise((resolve) => out.end(resolve));
    summary[name] = count;
  }
  fs.writeFileSync(path.join(dir, 'MANIFEST.json'), JSON.stringify({ createdAt: new Date().toISOString(), database: mongoose.connection.name, collections: summary }, null, 2));
  return { dir, summary };
};

if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const connectDB = require('../config/db');
  const args = process.argv.slice(2);
  const opt = (name) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  (async () => {
    console.log('Reminder: Atlas cloud backups are the primary backup. This is an extra portable export.');
    if (!(await connectDB())) process.exit(1);
    const result = await runBackup({ outDir: opt('out'), collections: opt('collections') ? opt('collections').split(',') : undefined });
    console.log(`Backup written to ${result.dir}`);
    console.table(result.summary);
    process.exit(0);
  })().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

module.exports = { runBackup };
