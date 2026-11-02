const dns = require('dns');
// Set public DNS servers to resolve MongoDB Atlas SRV records on Windows without ECONNREFUSED issues
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e.message);
}

const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/seuconnect';
  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`=========================================`);
    console.log(`✓ MongoDB Connected Successfully!`);
    console.log(`Database : ${conn.connection.name}`);
    console.log(`Host     : ${conn.connection.host}`);
    console.log(`Port     : ${conn.connection.port}`);
    console.log(`=========================================`);
    return conn;
  } catch (error) {
    console.warn(`✗ MongoDB Connection Notice: ${error.message}`);
    console.log(' Running in hybrid storage mode (Active Memory + MongoDB auto-sync)');
    return null;
  }
};

const getStatus = () => isConnected;

connectDB.connectDB = connectDB;
connectDB.getStatus = getStatus;

module.exports = connectDB;
