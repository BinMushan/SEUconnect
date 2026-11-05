process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const rbac = require('../../core/rbac');
const { buildSort, textFilter, listQuery } = require('../../core/pagination');
const { z, password, code } = require('../../core/validate');
const { toApiError, ApiError } = require('../../core/http');
const { sanitise } = require('../../core/audit');
const { byId, departmentFilter, wide } = require('../../core/scope');
const { hashPassword, verifyPassword, isHashed } = require('../../utils/password');
const { COURSE_CODE, COMPONENTS_BY_TYPE } = require('../../modules/courses/model');
const { windowMode } = require('../../modules/registration/service');

test('RBAC catalogue: every granted permission exists and every role has a valid scope', () => {
  const known = new Set(rbac.PERMISSIONS.map((p) => p.key));
  for (const [role, def] of Object.entries(rbac.ROLE_CATALOG)) {
    assert.ok(def.permissions && def.permissions.length, `${role} has permissions`);
    for (const p of def.permissions) {
      assert.ok(known.has(p.key), `${role} grants unknown permission ${p.key}`);
      assert.ok(rbac.SCOPES.includes(p.scope), `${role}:${p.key} has invalid scope ${p.scope}`);
    }
  }
});

test('RBAC: the seven specification roles exist and respect the intended boundaries', () => {
  const scopeOf = (role, key) => (rbac.ROLE_CATALOG[role].permissions.find((p) => p.key === key) || {}).scope;
  for (const r of ['admin', 'dean', 'faculty_admin', 'hod', 'lecturer', 'demonstrator', 'student']) assert.ok(rbac.ROLE_CATALOG[r], r);
  assert.equal(scopeOf('student', 'students.read'), 'own');
  assert.equal(scopeOf('student', 'students.write'), undefined);
  assert.equal(scopeOf('hod', 'students.write'), 'department');
  assert.equal(scopeOf('lecturer', 'students.read'), 'assigned');
  assert.equal(scopeOf('lecturer', 'offerings.read'), 'assigned');
  assert.equal(scopeOf('demonstrator', 'assessments.write'), 'assigned');
  assert.equal(scopeOf('student', 'users.write'), undefined);
  assert.equal(scopeOf('lecturer', 'roles.manage'), undefined);
  assert.equal(scopeOf('admin', 'roles.manage'), 'system');
  // only the system administrator manages roles / settings
  for (const r of Object.keys(rbac.ROLE_CATALOG).filter((k) => !['admin', 'superadmin'].includes(k))) {
    assert.equal(scopeOf(r, 'roles.manage'), undefined, `${r} must not manage roles`);
    assert.equal(scopeOf(r, 'system.settings'), undefined, `${r} must not edit system settings`);
  }
});

test('RBAC: scope ranking and can()', () => {
  assert.ok(rbac.rank('own') < rbac.rank('assigned') && rbac.rank('assigned') < rbac.rank('department') && rbac.rank('department') < rbac.rank('faculty') && rbac.rank('faculty') < rbac.rank('system'));
  const access = { permissions: new Map([['a.read', 'department']]) };
  assert.equal(rbac.can(access, 'a.read'), true);
  assert.equal(rbac.can(access, 'a.read', 'faculty'), false);
  assert.equal(rbac.can(access, 'a.write'), false);
});

test('RBAC: extendCatalog adds permissions and grants without duplicates', () => {
  rbac.extendCatalog({ permissions: [['unit.test', 'x', 'unit']], grants: { hod: [{ key: 'unit.test', scope: 'department' }], nosuchrole: [{ key: 'unit.test', scope: 'own' }] } });
  rbac.extendCatalog({ permissions: [['unit.test', 'x', 'unit']], grants: { hod: [{ key: 'unit.test', scope: 'department' }] } });
  assert.equal(rbac.PERMISSIONS.filter((p) => p.key === 'unit.test').length, 1);
  assert.equal(rbac.ROLE_CATALOG.hod.permissions.filter((p) => p.key === 'unit.test').length, 1);
});

test('pagination: sort is whitelisted and free-text search is escaped', () => {
  assert.deepEqual(buildSort('-name,code', ['name', 'code']), { name: -1, code: 1 });
  assert.deepEqual(buildSort('password,-secret', ['name'], '-name'), { name: -1 }); // unknown fields ignored
  const f = textFilter('a.*b(', ['name']);
  assert.ok(f.$or[0].name instanceof RegExp);
  assert.equal(f.$or[0].name.test('xxa.*b(yy'), true);
  assert.equal(f.$or[0].name.test('aXXb'), false, 'user input must not act as a regular expression');
  assert.equal(listQuery.parse({}).limit, 25);
  assert.throws(() => listQuery.parse({ limit: '1000' }));
});

test('validation: course codes, passwords, ids', () => {
  assert.ok(COURSE_CODE.test('ICT21013'));
  for (const bad of ['IC21013', 'ICT2101', 'ICT210133', 'ict21013', '1CT21013']) assert.equal(COURSE_CODE.test(bad), false, bad);
  assert.equal(password.safeParse('Passw0rdOK').success, true);
  for (const bad of ['short1A', 'alllowercase1', 'ALLUPPER1234', 'NoDigitsHere']) assert.equal(password.safeParse(bad).success, false, bad);
  assert.equal(code(/^[A-Z]{3}$/, 'x').parse(' abc '), 'ABC');
  assert.deepEqual(COMPONENTS_BY_TYPE, { A: ['theory'], B: ['theory', 'practical'], C: ['practical'] });
});

test('error mapping: validation, duplicate key and cast errors become safe API errors', () => {
  const zerr = (() => { try { z.object({ a: z.string() }).parse({}); } catch (e) { return e; } })();
  const mapped = toApiError(zerr);
  assert.equal(mapped.status, 422);
  assert.equal(mapped.code, 'VALIDATION_FAILED');
  assert.equal(toApiError({ code: 11000, keyValue: { email: 'x' } }).status, 409);
  assert.equal(toApiError({ name: 'CastError', path: '_id' }).code, 'INVALID_ID');
  assert.equal(toApiError(new Error('boom')), null); // unknown errors are NOT exposed (handled as 500 by the middleware)
  assert.ok(toApiError(new ApiError(403, 'X', 'y')) instanceof ApiError);
});

test('audit sanitiser never stores secrets', () => {
  const out = sanitise({ name: 'a', password: 'secret', nested: { token: 't', refreshToken: 'r', ok: 1 }, list: [{ passwordHash: 'h', v: 2 }] });
  assert.deepEqual(out, { name: 'a', nested: { ok: 1 }, list: [{ v: 2 }] });
});

test('scope helpers: byId keeps the requested id even when the scope constrains _id', () => {
  assert.deepEqual(byId('1', {}), { _id: '1' });
  assert.deepEqual(byId('1', { _id: '2' }), { $and: [{ _id: '1' }, { _id: '2' }] }); // regression: used to be { _id: '2' }
  const req = (scope, departments = []) => ({ access: { scope, departments } });
  assert.deepEqual(departmentFilter(req('faculty')), {});
  assert.deepEqual(departmentFilter(req('department', ['d1']), 'dept'), { dept: { $in: ['d1'] } });
  assert.equal(wide(req('system')), true);
  assert.equal(wide(req('own')), false);
});

test('passwords are hashed with scrypt, salted, and legacy plain text still verifies once', () => {
  const h1 = hashPassword('Secret123');
  const h2 = hashPassword('Secret123');
  assert.notEqual(h1, h2);
  assert.ok(isHashed(h1));
  assert.ok(verifyPassword('Secret123', h1));
  assert.ok(!verifyPassword('secret123', h1));
  assert.ok(verifyPassword('legacy', 'legacy')); // old plain-text rows are upgraded on first login
});

test('registration windows come from semester data and never default silently', () => {
  const d = (o) => new Date(Date.now() + o * 86400000);
  assert.equal(windowMode({}), 'not_configured');
  assert.equal(windowMode({ registrationOpens: d(-1), registrationCloses: d(1) }), 'registration');
  assert.equal(windowMode({ registrationOpens: d(-9), registrationCloses: d(-5), addDropOpens: d(-1), addDropCloses: d(3) }), 'add');
  assert.equal(windowMode({ registrationOpens: d(-9), registrationCloses: d(-5), addDropOpens: d(-4), addDropCloses: d(-2) }), 'closed');
});
