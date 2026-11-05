/**
 * /api/v1/reports - permission (reports.read) AND data-scope aware reporting.
 *   GET /reports                      catalogue of reports the caller may run
 *   GET /reports/:name?format=json    paginated JSON (page, limit)  - default
 *   GET /reports/:name?format=csv     full export, spreadsheet-safe
 * Any other query parameter is a report filter (department, batch, status, ...).
 */
const express = require('express');
const core = require('./reports');
const dependent = require('./dependent');
const { toCsv } = require('./csv');
const { z, validate } = require('../../core/validate');
const { asyncHandler, ok, notFound, forbidden } = require('../../core/http');
const { requirePermission, extendCatalog } = require('../../core/rbac');
const audit = require('../../core/audit');

// Students may run the reports that describe themselves (their own rows only).
extendCatalog({ grants: { student: [{ key: 'reports.read', scope: 'own' }] } });

const registry = { ...core.registry, ...dependent.registry };

const router = express.Router();
const guard = requirePermission('reports.read');

router.get('/', guard, asyncHandler(async (req, res) => {
  const list = Object.entries(registry)
    .filter(([, r]) => r.scopes.includes(req.access.scope))
    .map(([name, r]) => ({ name, title: r.title, columns: r.columns.map((c) => c.key), available: r.sources ? dependent.available(r.sources) : true }));
  ok(res, list);
}));

const query = z.object({ format: z.enum(['json', 'csv']).default('json'), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(500).default(50) }).passthrough();

router.get('/:name', guard, validate({ query }), asyncHandler(async (req, res) => {
  const report = registry[req.params.name];
  if (!report) throw notFound('Unknown report.', 'REPORT_UNKNOWN');
  if (!report.scopes.includes(req.access.scope)) throw forbidden('Your access level does not include this report.', 'REPORT_NOT_PERMITTED');
  const { format, page, limit, ...filters } = req.valid.query;
  const rows = await report.run(req, filters);

  if (format === 'csv') {
    await audit.record({ req, action: 'report.export', entityType: 'Report', entityId: req.params.name, after: { rows: rows.length, filters } });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.name}-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.send(`﻿${toCsv(report.columns, rows)}`);
  }
  const total = rows.length;
  return ok(res, rows.slice((page - 1) * limit, page * limit), { report: req.params.name, title: report.title, columns: report.columns, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
}));

module.exports = { routes: [{ path: 'reports', router }], registry };
