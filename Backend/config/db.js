const dns = require('dns');
// Set public DNS servers to resolve MongoDB Atlas SRV records on Windows without ECONNREFUSED issues
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e.message);
}

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;
    if (!connUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(connUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000
    });

    console.log(`=========================================`);
    console.log(`✓ MongoDB Atlas Connected Successfully!`);
    console.log(`Database : ${conn.connection.name}`);
    console.log(`Host     : ${conn.connection.host}`);
    console.log(`Port     : ${conn.connection.port}`);
    console.log(`=========================================`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Atlas Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
