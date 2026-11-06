require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true }); // always Backend/.env, whatever folder the server is started from
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
const timetableRoutes = require('./routes/timetableRoutes');
const studentRouter = require('./router/studentRouter');
const subjectRoutes = require('./routes/subjectRoutes');
const { seedHandbookSubjects } = require('./config/subjectSeeder');

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
}

// Auto-rewrite requests missing /api prefix so deployments work seamlessly whether VITE_API_URL has /api or not
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && (
    req.url.startsWith('/auth') ||
    req.url.startsWith('/processes') ||
    req.url.startsWith('/notifications') ||
    req.url.startsWith('/stats') ||
    req.url.startsWith('/student') ||
    req.url.startsWith('/subjects') ||
    req.url.startsWith('/academic-calendar') ||
    req.url.startsWith('/v1')
  )) {
    req.url = `/api${req.url}`;
  }
  next();
});

if (!isTest) {
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: Number(process.env.API_RATE_LIMIT || 600), standardHeaders: 'draft-7', legacyHeaders: false }));
}

// Health check endpoint for Render zero-downtime checks.
app.all(['/', '/health', '/api/health'], (req, res) => {
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
app.use('/api/subjects', subjectRoutes);
app.use('/api/timetable', timetableRoutes);

// ---- Versioned API: modular academic management (requires MongoDB) ----
app.use('/api/v1', (req, res, next) => (getStatus() ? next() : next(unavailable('The academic management API needs the MongoDB connection.'))));
app.use('/api/v1', (req, res, next) => (req.path.startsWith('/auth/') ? next() : authenticate(req, res, next)));
mountModules(app, '/api/v1');

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, error: { code: 'ROUTE_NOT_FOUND' } });
});
app.use(errorMiddleware(logger));

const startServer = async () => {
  const server = app.listen(PORT, () => {
    logger.info(`SEUConnect backend running on http://localhost:${PORT} (database: ${getStatus() ? 'MongoDB Atlas' : 'in-memory'})`);
  });

  try {
    await connectDB();
    await seedDatabase();
    await seedHandbookSubjects();
    await bootstrap();
  } catch (err) {
    logger.error('Bootstrap failed', { error: err.stack });
  }

  return server;
};

if (require.main === module) startServer();

module.exports = { app, startServer };
