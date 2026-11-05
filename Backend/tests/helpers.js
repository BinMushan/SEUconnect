/**
 * Integration-test harness. Each test file calls start() once: it boots the real Express app against a
 * THROW-AWAY MongoDB database (name made unique per process, dropped by stop()), never the live data.
 */
process.env.NODE_ENV = 'test';
process.env.SEED_DEMO_DATA = 'false';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });

const mongoose = require('mongoose');

const throwawayUri = () => {
  const base = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;
  if (!base) throw new Error('Set MONGODB_URI (or TEST_MONGODB_URI) to run the integration tests.');
  const u = new URL(base);
  u.pathname = `/seuconnect_test_${Date.now()}_${process.pid}`;
  return u.toString();
};

let server;
let base;

const start = async () => {
  process.env.MONGODB_URI = throwawayUri();
  const connectDB = require('../config/db');
  const conn = await connectDB();
  if (!conn) throw new Error('Could not connect to MongoDB for tests.');
  const { bootstrap } = require('../core/bootstrap');
  await bootstrap();
  const { app } = require('../server');
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  return { base };
};

const stop = async () => {
  if (server) await new Promise((r) => server.close(r));
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
};

const call = async (method, path, token, body) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json, data: json.data, meta: json.meta, code: json.error && json.error.code };
};

const PASSWORD = 'Passw0rd-Test';
let counter = 0;

/** Creates an account directly in the database (bypassing the API) and signs in; returns { user, token, refreshToken }. */
const makeUser = async ({ role, name, department, departmentRef, email }) => {
  const User = require('../models/User');
  const { hashPassword } = require('../utils/password');
  counter += 1;
  const user = await User.create({
    name: name || `${role} ${counter}`,
    email: email || `${role}.${counter}.${Date.now()}@test.seu`,
    password: hashPassword(PASSWORD),
    role,
    roleKey: role,
    department: department || '',
    departmentRef: departmentRef || null,
  });
  const res = await call('POST', '/api/v1/auth/login', null, { email: user.email, password: PASSWORD });
  if (res.status !== 200) throw new Error(`login failed for ${role}: ${JSON.stringify(res.body)}`);
  return { user, token: res.data.accessToken, refreshToken: res.data.refreshToken, email: user.email };
};

const login = (email, password = PASSWORD) => call('POST', '/api/v1/auth/login', null, { email, password });

module.exports = { start, stop, call, makeUser, login, PASSWORD };
