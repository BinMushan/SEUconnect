const { test } = require('node:test');
const assert = require('node:assert/strict');
const { allocate } = require('../../modules/allocation/engine');

const POLICY = { criteria: [{ key: 'gpa', weight: 1, direction: 'desc' }], tieBreakers: [] };
const app = (n, gpa, prefs, at = 1000 + n) => ({ student: `S${String(n).padStart(3, '0')}`, submittedAt: at, preferences: prefs, metrics: { gpa } });

test('missing or malformed policy is refused (never guesses weights)', () => {
  for (const bad of [null, undefined, {}, { criteria: [] }, { criteria: [{ key: 'gpa', weight: 'x' }] }, { criteria: [{ key: 'gpa', weight: 0 }] }]) {
    assert.throws(() => allocate({ applicants: [app(1, 3, ['A'])], capacities: { A: 1 }, policy: bad }), (e) => e.code === 'POLICY_NOT_CONFIGURED');
  }
});

test('capacity is never exceeded and the best-ranked applicants win the seats', () => {
  const applicants = [app(1, 3.1, ['A']), app(2, 3.9, ['A']), app(3, 3.5, ['A']), app(4, 2.0, ['A'])];
  const r = allocate({ applicants, capacities: { A: 2 }, policy: POLICY });
  assert.deepEqual(r.allocations.map((a) => a.student), ['S002', 'S003']);
  assert.deepEqual(r.unallocated.map((u) => u.student), ['S001', 'S004']);
  assert.equal(r.seatsLeft.A, 0);
});

test('each student gets the highest-ranked preference that still has seats', () => {
  const applicants = [app(1, 4.0, ['A', 'B']), app(2, 3.9, ['A', 'B']), app(3, 3.8, ['A', 'B']), app(4, 3.7, ['B', 'A'])];
  const r = allocate({ applicants, capacities: { A: 2, B: 2 }, policy: POLICY });
  const by = Object.fromEntries(r.allocations.map((a) => [a.student, a]));
  assert.equal(by.S001.specialization, 'A');
  assert.equal(by.S002.specialization, 'A');
  assert.equal(by.S003.specialization, 'B'); // A is full, second preference
  assert.equal(by.S003.preferenceRank, 2);
  assert.equal(by.S004.specialization, 'B'); // wanted B first
  assert.equal(by.S004.preferenceRank, 1);
});

test('60 applicants for 50 SWT seats: the 10 unsuccessful are NOT pushed into NST unless NST was a preference and has seats', () => {
  const applicants = [];
  // 60 applicants, SWT only. Ten of them also listed NST (as 2nd choice).
  for (let i = 1; i <= 60; i += 1) applicants.push(app(i, 4 - i * 0.01, i > 50 && i <= 55 ? ['SWT', 'NST'] : ['SWT']));
  const r = allocate({ applicants, capacities: { SWT: 50, NST: 5 }, policy: POLICY });
  const swt = r.allocations.filter((a) => a.specialization === 'SWT');
  const nst = r.allocations.filter((a) => a.specialization === 'NST');
  assert.equal(swt.length, 50);
  assert.deepEqual(nst.map((a) => a.student), ['S051', 'S052', 'S053', 'S054', 'S055']); // only those who listed NST, within its 5 seats
  const flagged = r.unallocated.map((u) => u.student);
  assert.deepEqual(flagged, ['S056', 'S057', 'S058', 'S059', 'S060']); // listed only SWT -> manual review, never NST
  assert.ok(r.unallocated.every((u) => u.manualReview && u.reason === 'ALL_PREFERENCES_FULL'));

  // NST full as well: listed-NST applicants beyond its capacity stay unallocated too
  const tight = allocate({ applicants, capacities: { SWT: 50, NST: 2 }, policy: POLICY });
  assert.equal(tight.allocations.filter((a) => a.specialization === 'NST').length, 2);
  assert.equal(tight.unallocated.length, 8);
});

test('minimum-applications rule: a division with too few applications is not offered and applicants are re-evaluated', () => {
  const caps = { AAT: 20, AEE: 20, BSE: 20 };
  const applicants = [];
  for (let i = 1; i <= 12; i += 1) applicants.push(app(i, 3 + i * 0.01, ['AAT', 'BSE']));
  for (let i = 13; i <= 15; i += 1) applicants.push(app(i, 3 + i * 0.01, ['AEE', 'AAT'])); // only 3 want AEE
  for (let i = 16; i <= 28; i += 1) applicants.push(app(i, 3 + i * 0.01, ['BSE']));
  const r = allocate({ applicants, capacities: caps, policy: POLICY, minApplications: 10, countBasis: 'first_preference' });
  assert.deepEqual(r.notOffered.map((n) => n.specialization), ['AEE']);
  const aeeStudents = r.allocations.filter((a) => ['S013', 'S014', 'S015'].includes(a.student));
  assert.ok(aeeStudents.every((a) => a.specialization === 'AAT')); // fell to their next preference, AAT
  assert.equal(r.allocations.filter((a) => a.specialization === 'AEE').length, 0);

  // re-evaluation can cascade: after AEE is dropped AAT gains the 3 and survives, but a weaker track is removed first
  const cascade = allocate({
    applicants: [...Array(10).keys()].map((i) => app(i + 1, 3, ['X'])).concat([...Array(9).keys()].map((i) => app(i + 11, 3, ['Y', 'X']))),
    capacities: { X: 50, Y: 50 }, policy: POLICY, minApplications: 10, countBasis: 'first_preference',
  });
  assert.deepEqual(cascade.notOffered.map((n) => n.specialization), ['Y']); // Y has 9 < 10
  assert.equal(cascade.allocations.length, 19); // all fall through to X
  assert.equal(cascade.stats.iterations, 1);

  // any_preference basis counts every listed division
  const anyBasis = allocate({ applicants, capacities: caps, policy: POLICY, minApplications: 10, countBasis: 'any_preference' });
  assert.deepEqual(anyBasis.notOffered.map((n) => n.specialization), ['AEE']); // listed by exactly 3 students
});

test('ties are broken by the configured tie-breakers, then application time, then student id', () => {
  const policy = { criteria: [{ key: 'gpa', weight: 1, direction: 'desc' }], tieBreakers: [{ key: 'year1', direction: 'desc' }] };
  const mk = (n, y, at) => ({ student: `S${n}`, submittedAt: at, preferences: ['A'], metrics: { gpa: 3.5, year1: y } });
  const r = allocate({ applicants: [mk(1, 3.0, 10), mk(2, 3.4, 20), mk(3, 3.4, 5), mk(4, 3.4, 5)], capacities: { A: 3 }, policy });
  // S2,S3,S4 tie on year1=3.4; S3 and S4 applied earlier (5), S3 < S4 by id; S1 loses on the tie-breaker
  assert.deepEqual(r.allocations.map((a) => a.student), ['S3', 'S4', 'S2']);
  assert.deepEqual(r.unallocated.map((u) => u.student), ['S1']);
});

test('weights are data: a different weighting changes the ranking', () => {
  const mk = (n, a, b) => ({ student: `S${n}`, submittedAt: n, preferences: ['A'], metrics: { common: a, first: b } });
  const people = [mk(1, 3.9, 2.0), mk(2, 2.5, 3.9)];
  const heavyCommon = allocate({ applicants: people, capacities: { A: 1 }, policy: { criteria: [{ key: 'common', weight: 0.8 }, { key: 'first', weight: 0.2 }] } });
  const heavyFirst = allocate({ applicants: people, capacities: { A: 1 }, policy: { criteria: [{ key: 'common', weight: 0.2 }, { key: 'first', weight: 0.8 }] } });
  assert.equal(heavyCommon.allocations[0].student, 'S1');
  assert.equal(heavyFirst.allocations[0].student, 'S2');
});

test('eligibility: missing metrics and minimum thresholds exclude applicants (never invented)', () => {
  const policy = { criteria: [{ key: 'gpa', weight: 1 }], eligibility: { minValues: { gpa: 2.0 } } };
  const r = allocate({
    applicants: [app(1, 3.0, ['A']), { student: 'S002', submittedAt: 1, preferences: ['A'], metrics: {} }, app(3, 1.5, ['A']), { ...app(4, 3.0, ['A']), blocked: 'STUDENT_NOT_ACTIVE' }],
    capacities: { A: 5 }, policy,
  });
  assert.deepEqual(r.allocations.map((a) => a.student), ['S001']);
  assert.deepEqual(r.ineligible.map((i) => i.reason).sort(), ['BELOW_MINIMUM:gpa', 'MISSING_METRIC:gpa', 'STUDENT_NOT_ACTIVE']);
});

test('determinism: shuffled input produces identical output', () => {
  const base = [];
  for (let i = 1; i <= 40; i += 1) base.push(app(i, 3 + ((i * 7) % 10) / 10, i % 3 ? ['A', 'B'] : ['B', 'A'], 1000 + (i % 5)));
  const run = (list) => JSON.stringify(allocate({ applicants: list, capacities: { A: 15, B: 15 }, policy: POLICY }));
  const expected = run(base);
  for (let k = 0; k < 5; k += 1) {
    const shuffled = [...base].sort((a, b) => ((a.student.charCodeAt(2) * (k + 3)) % 11) - ((b.student.charCodeAt(2) * (k + 3)) % 11));
    assert.equal(run(shuffled), expected);
  }
});

test('preferences for tracks without seats are skipped; unknown tracks never receive students', () => {
  const r = allocate({ applicants: [app(1, 3.5, ['Z', 'A'])], capacities: { A: 1, Z: 0 }, policy: POLICY });
  assert.equal(r.allocations[0].specialization, 'A');
  assert.equal(r.allocations[0].preferenceRank, 2);
  const none = allocate({ applicants: [app(1, 3.5, ['Q'])], capacities: { A: 1 }, policy: POLICY });
  assert.equal(none.allocations.length, 0);
  assert.equal(none.unallocated[0].reason, 'NO_OFFERED_PREFERENCE');
});
