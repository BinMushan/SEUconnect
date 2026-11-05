// npm run migrate - applies pending migrations (they also run automatically on server start).
require('dotenv').config({ quiet: true });
const connectDB = require('../config/db');
const { runMigrations } = require('../migrations/runner');

(async () => {
  const conn = await connectDB();
  if (!conn) process.exit(1);
  // models must be registered so every index is built
  require('../core/modules').mountModules({ use() {} });
  const applied = await runMigrations();
  console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'No pending migrations.');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
