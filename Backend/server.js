require('dotenv').config({ quiet: true });
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { getStatus } = require('./config/db');
const { seedDatabase } = require('./seedData');
const logger = require('./core/logger');
const { errorMiddleware, unavailable } = require('./core/http');
const { mountModules } = require('./core/modules');
const { bootstrap } = require('./core/bootstrap');
const { authenticate } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const processRoutes = require('./routes/processRoutes');
const statsRoutes = require('./routes/statsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const academicCalendarRoutes = require('./routes/academicCalendarRoutes');
const studentRouter = require('./router/studentRouter');

const app = express();
const PORT = process.env.PORT || 5000;
const isTest = process.env.NODE_ENV === 'test';

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Receipt uploads in the examination workflows arrive as base64 data URLs (5 MB file limit enforced there).
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});
if (!isTest) {
  app.use((req, res, next) => {
    res.on('finish', () => logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, { id: req.id }));
    next();
  });
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: Number(process.env.API_RATE_LIMIT || 600), standardHeaders: 'draft-7', legacyHeaders: false }));
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SEUConnect Academic & Administrative Digitization Platform',
    faculty: 'Faculty of Technology, South Eastern University of Sri Lanka',
    database: getStatus() ? 'mongodb' : 'in-memory',
    timestamp: new Date(),
  });
});

// ---- Legacy API (examination-form workflows, used by the current frontend) ----
if (!isTest) {
  app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: Number(process.env.LOGIN_RATE_LIMIT || 30), standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Too many login attempts. Please wait and try again.' } }));
}
app.use('/api/auth', authRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/academic-calendar', academicCalendarRoutes);
app.use('/api/student', studentRouter);

// ---- Versioned API: modular academic management (requires MongoDB) ----
app.use('/api/v1', (req, res, next) => (getStatus() ? next() : next(unavailable('The academic management API needs the MongoDB connection.'))));
app.use('/api/v1', (req, res, next) => (req.path.startsWith('/auth/') ? next() : authenticate(req, res, next)));
mountModules(app, '/api/v1');

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, error: { code: 'ROUTE_NOT_FOUND' } });
});
app.use(errorMiddleware(logger));

const startServer = async () => {
  await connectDB();
  await seedDatabase();
  try {
    await bootstrap();
  } catch (err) {
    logger.error('Bootstrap failed', { error: err.stack });
  }
  app.listen(PORT, () => {
    logger.info(`SEUConnect backend running on http://localhost:${PORT} (database: ${getStatus() ? 'MongoDB Atlas' : 'in-memory'})`);
  });
};

if (require.main === module) startServer();

module.exports = { app, startServer };
