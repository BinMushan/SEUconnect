/**
 * Auto-registers every folder in Backend/modules that has an index.js.
 * index.js exports { routes: [{ path, router }] } (or a single { path, router }); each is mounted at
 * /api/v1/<path>. New modules are added by creating a folder - no shared file has to be edited.
 */
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const mountModules = (app, basePath = '/api/v1') => {
  const dir = path.join(__dirname, '..', 'modules');
  const mounted = [];
  for (const name of fs.readdirSync(dir).sort()) {
    const entry = path.join(dir, name, 'index.js');
    if (!fs.existsSync(entry)) continue;
    const mod = require(entry);
    const routes = mod.routes || (mod.router ? [{ path: mod.path || name, router: mod.router }] : []);
    for (const r of routes) {
      app.use(`${basePath}/${r.path}`, r.router);
      mounted.push(`${basePath}/${r.path}`);
    }
  }
  logger.debug('Mounted modules', { mounted });
  return mounted;
};

module.exports = { mountModules };
