// Small levelled logger: readable in development, one JSON object per line in production.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = () => LEVELS[process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'info')] || LEVELS.info;

const write = (level, message, meta) => {
  if (LEVELS[level] < threshold()) return;
  if (process.env.NODE_ENV === 'production') {
    process.stdout.write(`${JSON.stringify({ time: new Date().toISOString(), level, message, ...meta })}\n`);
    return;
  }
  const line = `[${new Date().toISOString().slice(11, 19)}] ${level.toUpperCase()} ${message}`;
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(meta ? `${line} ${JSON.stringify(meta)}` : line);
};

module.exports = {
  debug: (m, meta) => write('debug', m, meta),
  info: (m, meta) => write('info', m, meta),
  warn: (m, meta) => write('warn', m, meta),
  error: (m, meta) => write('error', m, meta),
};
