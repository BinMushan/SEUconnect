/**
 * Minimal migration runner. Files in this folder named NNN_description.js export
 *   { id, description, up(db, mongoose) }
 * and are applied once, in filename order; applied ids are stored in the `migrations` collection.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Migration = mongoose.models.Migration || mongoose.model('Migration', new mongoose.Schema({ id: { type: String, unique: true }, description: String, appliedAt: Date }, { collection: 'migrations' }));

const runMigrations = async () => {
  const files = fs.readdirSync(__dirname).filter((f) => /^\d{3}_.+\.js$/.test(f)).sort();
  const done = new Set((await Migration.find({}).lean()).map((m) => m.id));
  const applied = [];
  for (const file of files) {
    const migration = require(path.join(__dirname, file));
    if (done.has(migration.id)) continue;
    await migration.up(mongoose.connection.db, mongoose);
    await Migration.create({ id: migration.id, description: migration.description, appliedAt: new Date() });
    applied.push(migration.id);
  }
  return applied;
};

module.exports = { runMigrations };
