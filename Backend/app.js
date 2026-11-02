require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const studentRouter = require('./router/studentRouter');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'SEUConnect Student Backend API',
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    dbName: mongoose.connection.name,
    timestamp: new Date().toISOString()
  });
});

// Mount Student API Routes (Only for Student)
app.use('/api/student', studentRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 SEUConnect Student Backend Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api/student`);
  console.log(`💓 Health:   http://localhost:${PORT}/api/health`);
});

module.exports = app;
