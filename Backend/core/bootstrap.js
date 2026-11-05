/**
 * Idempotent start-up initialisation (safe to run on every boot):
 *   1. sync the permission / role catalogue (never overwrites roles edited by an administrator)
 *   2. create the faculty structure and default policies from config/academicStructure.seed.js
 *   3. link legacy users (free-text department) to the normalised Department collection
 *   4. run pending migrations
 */
const mongoose = require('mongoose');
const logger = require('./logger');
const { syncCatalog } = require('./rbac');
const { runMigrations } = require('../migrations/runner');
const seed = require('../config/academicStructure.seed');
const { Department, DegreeProgramme, Specialization } = require('../modules/organization/model');
const AcademicPolicy = require('../modules/policy/model');
const User = require('../models/User');
const { deptCode } = require('../utils/roles');
const { seedDemoAcademicData } = require('./demoData');

// Same switch as the demo accounts in seedData.js: demo data never lands in production unless requested.
const demoEnabled = () => (process.env.SEED_DEMO_DATA ? process.env.SEED_DEMO_DATA === 'true' : process.env.NODE_ENV !== 'production');

const seedStructure = async () => {
  const deptByCode = {};
  for (const d of seed.departments) {
    deptByCode[d.code] = await Department.findOneAndUpdate({ code: d.code }, { $setOnInsert: d }, { upsert: true, returnDocument: 'after' });
  }
  for (const p of seed.programmes) {
    const dept = deptByCode[p.department];
    const programme = await DegreeProgramme.findOneAndUpdate(
      { code: p.code },
      { $setOnInsert: { code: p.code, name: p.name, department: dept._id } },
      { upsert: true, returnDocument: 'after' }
    );
    for (const t of p.tracks) {
      await Specialization.updateOne({ programme: programme._id, code: t.code }, { $setOnInsert: { programme: programme._id, ...t } }, { upsert: true });
    }
  }
  for (const pol of seed.policies) {
    const exists = await AcademicPolicy.exists({ key: pol.key, 'scope.programme': null, 'scope.department': null });
    if (!exists) await AcademicPolicy.create({ ...pol, status: 'pending_confirmation' });
  }
  return deptByCode;
};

// Legacy users carry the department as text ("Department of Information ..."); attach the real reference.
const linkUsers = async (deptByCode) => {
  const byShort = { ICT: deptByCode.DICT, BST: deptByCode.DBST };
  const users = await User.find({ departmentRef: null }).select('department');
  for (const u of users) {
    const dept = byShort[deptCode(u.department)];
    if (dept) await User.updateOne({ _id: u._id }, { departmentRef: dept._id });
  }
};

// New models appear with every phase, so indexes (unique constraints included) are ensured on each start.
const syncIndexes = async () => {
  for (const model of Object.values(mongoose.models)) {
    if (model.modelName === 'Migration') continue;
    try {
      await model.createIndexes();
    } catch (err) {
      // 85/86: an index with the same name but an older definition exists (e.g. sparse -> partial). Let mongoose
      // reconcile this one model: it drops the stale index and builds the current one.
      if (err.code === 85 || err.code === 86) {
        try {
          await model.syncIndexes();
          logger.info(`Rebuilt changed indexes for ${model.modelName}`);
        } catch (inner) {
          logger.error(`Could not rebuild indexes for ${model.modelName}`, { error: inner.message });
        }
        continue;
      }
      logger.error(`Could not build indexes for ${model.modelName}`, { error: err.message });
    }
  }
};

const bootstrap = async () => {
  if (mongoose.connection.readyState !== 1) return false;
  await syncCatalog();
  const deptByCode = await seedStructure();
  await linkUsers(deptByCode);
  if (demoEnabled()) await seedDemoAcademicData();
  const applied = await runMigrations();
  await syncIndexes();
  try {
    const seeded = await require('../modules/assistant/seed').seedKnowledge();
    if (seeded) logger.info(`Assistant knowledge base: added ${seeded} document(s)`);
  } catch (err) {
    logger.error('Assistant knowledge seeding failed', { error: err.message });
  }
  logger.info(`Academic structure ready${applied.length ? `; applied migrations: ${applied.join(', ')}` : ''}`);
  return true;
};

module.exports = { bootstrap };
