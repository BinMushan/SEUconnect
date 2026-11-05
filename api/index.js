const connectDB = require('../Backend/config/db');
const { seedDatabase } = require('../Backend/seedData');
const { bootstrap } = require('../Backend/core/bootstrap');
const { app } = require('../Backend/server');

let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await connectDB();
      await seedDatabase();
      await bootstrap();
    } catch (err) {
      console.error('Vercel serverless init error:', err);
    }
    isInitialized = true;
  }
  return app(req, res);
};
