const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/seuconnect';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(` MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(` MongoDB Connection Notice: ${err.message}`);
    console.log(' Running in hybrid storage mode (Active Memory + MongoDB auto-sync)');
    return null;
  }
};

const getStatus = () => isConnected;

module.exports = { connectDB, getStatus };
