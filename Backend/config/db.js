const dns = require('dns');

// Some networks (notably Windows with ISP resolvers) cannot resolve MongoDB Atlas hostnames through the
// operating-system resolver. SRV records are resolved with public DNS, and the shard hostnames the
// driver then connects to fall back to public DNS only when the system lookup fails.
const publicResolver = new dns.Resolver();
try {
  publicResolver.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e.message);
}

const systemLookup = dns.lookup;
dns.lookup = function lookupWithAtlasFallback(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const opts = typeof options === 'number' ? { family: options } : options || {};
  systemLookup.call(dns, hostname, opts, (err, address, family) => {
    if (!err || !/\.mongodb\.net$/i.test(String(hostname))) return callback(err, address, family);
    publicResolver.resolve4(hostname, (resolveErr, addresses) => {
      if (resolveErr || !addresses || !addresses.length) return callback(err);
      if (opts.all) return callback(null, addresses.map((a) => ({ address: a, family: 4 })));
      return callback(null, addresses[0], 4);
    });
  });
};

const mongoose = require('mongoose');

const DB_NAME = () => process.env.MONGODB_DB_NAME || 'seuconnect';

/**
 * Connects to MongoDB Atlas using MONGODB_URI. There is no local fallback: without a URI (or if
 * Atlas cannot be reached) the workflow module keeps working in in-memory demo mode, while the
 * academic modules report that a database is required.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.warn('✗ MONGODB_URI is not set. Running in in-memory demo mode (data is lost on restart).');
    return null;
  }
  try {
    // An explicit database name inside the URI (used by tests) wins over MONGODB_DB_NAME.
    const uriHasDb = /^\/[^/?]+/.test(uri.replace(/^mongodb(?:\+srv)?:\/\/[^/]*/, ''));
    const conn = await mongoose.connect(uri, {
      ...(uriHasDb ? {} : { dbName: DB_NAME() }),
      autoIndex: true,
      serverSelectionTimeoutMS: 8000,
    });
    console.log('=========================================');
    console.log('✓ MongoDB Atlas connected');
    console.log(`Database : ${conn.connection.name}`);
    console.log(`Host     : ${conn.connection.host}`);
    console.log('=========================================');
    return conn;
  } catch (error) {
    console.warn(`✗ MongoDB connection failed: ${error.message}`);
    console.log(' Running in in-memory demo mode (data is lost when the server restarts).');
    return null;
  }
};

// Always reflects the live driver state, so a dropped connection falls back cleanly.
const getStatus = () => mongoose.connection.readyState === 1;

connectDB.connectDB = connectDB;
connectDB.getStatus = getStatus;

module.exports = connectDB;
