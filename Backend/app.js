// Legacy entry point kept so `npm run start:student` still works.
// The student API is now mounted by server.js at /api/student alongside everything else.
require('./server').startServer();
