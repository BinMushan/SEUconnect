const mongoose = require('mongoose');
const { unavailable } = require('./http');

/**
 * Runs `fn(session)` in a MongoDB transaction (Atlas replica set). Transient errors and write
 * conflicts are retried by the driver. Pass the session to every query inside `fn`.
 */
const withTransaction = async (fn) => {
  if (mongoose.connection.readyState !== 1) throw unavailable();
  return mongoose.connection.transaction(async (session) => fn(session), {
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
  });
};

module.exports = { withTransaction };
