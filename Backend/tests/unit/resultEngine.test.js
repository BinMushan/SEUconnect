const { test } = require('node:test');
const assert = require('node:assert/strict');
const E = require('../../modules/results/resultEngine');

// The numbers below are TEST DATA only (taken from the specification's examples); the engine hard-codes none of them.
const cfg = (caWeight, esaWeight, extra = {}) => ({ caWeight, esaWeight, minCaPercent: null, minEsaPercent: null, minFinalPercent: null, ...extra });
const policy = (over = {}) => ({
  bands: [
    { min: 0, max: 39.99, grade: 'F', gradePoint: 0, fail: true },
    { min: 40, max: 69.99, grade: 'B', gradePoint: 3 },
    { min: 70, max: 100, grade: 'A', gradePoint: 4 },
  ],
  ...over,
});

test('specification example 1: theory CA 80 / ESA 70 at 40/60 = 74', () => {
  const r = E.component({ ca: 80, esa: 70, config: cfg(40, 60) });
  assert.equal(r.mark, 74);
  assert.equal(r.passed, true);
});

test('specification example 2: practical CA 90 / ESA 80 at 50/50 = 85', () => {
  assert.equal(E.component({ ca: 90, esa: 80, config: cfg(50, 50) }).mark, 85);
});

test('weights are data: the same marks give different results under other weights', () => {
  assert.equal(E.component({ ca: 80, esa: 70, config: cfg(30, 70) }).mark, 73);
  assert.equal(E.component({ ca: 80, esa: 70, config: cfg(100, 0) }).mark, 80);
  assert.equal(E.component({ ca: null, esa: 70, config: cfg(0, 100) }).mark, 70);
});

test('exact decimal arithmetic (no floating point drift)', () => {
  // 0.1 + 0.2 style trap: 33.3 * 0.3 + 66.6 * 0.7 must be exactly 56.61
  assert.equal(E.component({ ca: 33.3, esa: 66.6, config: cfg(30, 70) }).mark, 56.61);
});

test('weights that do not add up to 100 are rejected', () => {
  assert.throws(() => E.component({ ca: 50, esa: 50, config: cfg(40, 50) }), { code: 'WEIGHTS_INVALID' });
  assert.throws(() => E.component({ ca: 50, esa: 50, config: cfg(-10, 110) }), { code: 'WEIGHTS_INVALID' });
  assert.throws(() => E.validateComponentWeights([60, 30]), { code: 'COMPONENT_WEIGHTS_INVALID' });
  E.validateComponentWeights([70, 30]);
});

test('component pass rules come from the configuration (CA below minimum fails the component)', () => {
  const config = cfg(40, 60, { minCaPercent: 40, minEsaPercent: 35 });
  const lowCa = E.component({ ca: 39, esa: 90, config });
  assert.equal(lowCa.caPassed, false);
  assert.equal(lowCa.passed, false);
  assert.ok(lowCa.mark > 40); // overall mark is fine, the component still fails
  const lowEsa = E.component({ ca: 90, esa: 34.99, config });
  assert.equal(lowEsa.esaPassed, false);
  assert.equal(E.component({ ca: 40, esa: 35, config }).passed, true); // minimums are inclusive
  assert.equal(E.component({ ca: 40, esa: 35, config: cfg(40, 60, { minFinalPercent: 50 }) }).finalPassed, false);
  assert.equal(E.component({ ca: 10, esa: 10, config: cfg(40, 60, { minCaPercent: null }) }).passed, true); // null = not enforced
});

test('CA percentage uses assessment weights and maximum marks', () => {
  const items = [
    { name: 'Quiz', marks: 8, maxMarks: 10, weight: 20 },
    { name: 'Midterm', marks: 30, maxMarks: 50, weight: 30 },
    { name: 'Project', marks: 90, maxMarks: 100, weight: 50 },
  ];
  // (0.8*20 + 0.6*30 + 0.9*50) / 100 * 100 = 79
  assert.equal(E.caPercent(items).toNumber(), 79);
  // weights are relative, not required to sum to 100
  assert.equal(E.caPercent(items.map((i) => ({ ...i, weight: i.weight * 2 }))).toNumber(), 79);
  assert.throws(() => E.caPercent([{ name: 'X', marks: null, maxMarks: 10, weight: 10 }]), { code: 'MARK_MISSING' });
  assert.equal(E.caPercent([{ name: 'X', marks: null, absent: true, maxMarks: 10, weight: 10 }, { name: 'Y', marks: 10, maxMarks: 10, weight: 10 }]).toNumber(), 50);
  assert.throws(() => E.caPercent([{ name: 'X', marks: 11, maxMarks: 10, weight: 10 }]), { code: 'MARK_OUT_OF_RANGE' });
  assert.throws(() => E.caPercent([]), { code: 'CA_NOT_CONFIGURED' });
});

test('ESA over several records is sum(marks)/sum(max)', () => {
  assert.equal(E.esaPercent([{ marks: 30, maxMarks: 40 }, { marks: 45, maxMarks: 60 }]).toNumber(), 75);
});

test('rounding is a policy: none = exact, otherwise the configured mode and decimals', () => {
  const c = cfg(50, 50);
  assert.equal(E.component({ ca: 70.15, esa: 70.2, config: c }).mark, 70.175);
  const half_up = E.component({ ca: 70.15, esa: 70.2, config: c, rounding: { mode: 'half_up', decimals: 2 } }).mark;
  const half_even = E.component({ ca: 70.15, esa: 70.2, config: c, rounding: { mode: 'half_even', decimals: 2 } }).mark;
  const down = E.component({ ca: 70.15, esa: 70.2, config: c, rounding: { mode: 'down', decimals: 2 } }).mark;
  assert.equal(half_up, 70.18);
  assert.equal(half_even, 70.18); // 70.175 -> even neighbour 70.18
  assert.equal(down, 70.17);
  assert.equal(E.component({ ca: 70.25, esa: 70.2, config: c, rounding: { mode: 'half_even', decimals: 2 } }).mark, 70.22);
  assert.equal(E.component({ ca: 70.25, esa: 70.2, config: c, rounding: { mode: 'half_up', decimals: 2 } }).mark, 70.23);
  assert.throws(() => E.round(E.round.constructor && require('decimal.js')(1.234), { decimals: 2 }), { code: 'ROUNDING_NOT_CONFIGURED' });
  // applyTo limits where rounding happens
  assert.equal(E.component({ ca: 70.15, esa: 70.2, config: c, rounding: { mode: 'half_up', decimals: 0, applyTo: ['courseMark'] } }).mark, 70.175);
});

test('course mark combines components by their weight in the course', () => {
  const r = E.course({ components: [{ mark: 74, passed: true, weightInCourse: 70 }, { mark: 85, passed: true, weightInCourse: 30 }] });
  assert.equal(r.mark, 77.3);
  assert.equal(r.allComponentsPassed, true);
  assert.throws(() => E.course({ components: [{ mark: 74, passed: true, weightInCourse: 70 }] }), { code: 'COMPONENT_WEIGHTS_INVALID' });
});

test('a missing grade policy is refused - boundaries are never guessed', () => {
  assert.throws(() => E.grade(74, null), { code: 'GRADE_POLICY_NOT_CONFIGURED' });
  assert.throws(() => E.grade(74, { bands: [] }), { code: 'GRADE_POLICY_NOT_CONFIGURED' });
  assert.throws(() => E.gradeCourse({ components: [], policy: undefined }), { code: 'GRADE_POLICY_NOT_CONFIGURED' });
});

test('grade lookup uses the policy bands, inclusive on both ends, and reports gaps', () => {
  assert.deepEqual(E.grade(74, policy()), { grade: 'A', gradePoint: 4, fail: false });
  assert.equal(E.grade(70, policy()).grade, 'A');
  assert.equal(E.grade(69.99, policy()).grade, 'B');
  assert.equal(E.grade(20, policy()).fail, true);
  assert.throws(() => E.grade(39.995, policy()), { code: 'GRADE_BAND_NOT_FOUND' });
});

test('band validation rejects overlaps and inverted ranges', () => {
  E.validateBands(policy().bands);
  assert.throws(() => E.validateBands([{ min: 0, max: 50, grade: 'F' }, { min: 50, max: 100, grade: 'P' }]), { code: 'BANDS_INVALID' });
  assert.throws(() => E.validateBands([{ min: 60, max: 40, grade: 'X' }]), { code: 'BANDS_INVALID' });
  assert.throws(() => E.validateBands([]), { code: 'BANDS_INVALID' });
});

test('full course grading: theory + practical, bands, pass rule', () => {
  const assess = (m) => [{ name: 'A1', marks: m, maxMarks: 100, weight: 100 }];
  const comps = (caT, esaT, caP, esaP) => [
    { type: 'theory', weightInCourse: 70, config: cfg(40, 60, { minCaPercent: 40, minEsaPercent: 35 }), ca: assess(caT), esa: [{ marks: esaT, maxMarks: 100 }] },
    { type: 'practical', weightInCourse: 30, config: cfg(50, 50), ca: assess(caP), esa: [{ marks: esaP, maxMarks: 100 }] },
  ];
  const ok = E.gradeCourse({ components: comps(80, 70, 90, 80), policy: policy() });
  assert.equal(ok.finalMark, 77.3);
  assert.equal(ok.grade, 'A');
  assert.equal(ok.gradePoint, 4);
  assert.equal(ok.passed, true);
  assert.deepEqual(ok.components.map((c) => c.mark), [74, 85]);

  // CA of the theory component below the configured minimum: the course is not passed even with an A-band mark
  const lowCa = E.gradeCourse({ components: comps(30, 100, 90, 80), policy: policy() });
  assert.equal(lowCa.components[0].caPassed, false);
  assert.equal(lowCa.passed, false);
  // ...unless the policy says only the course mark decides
  assert.equal(E.gradeCourse({ components: comps(30, 100, 90, 80), policy: policy({ passRule: 'course_mark_only' }) }).passed, true);
  // failing band always fails
  assert.equal(E.gradeCourse({ components: comps(10, 10, 10, 10), policy: policy() }).passed, false);
  // CA configuration with no assessments cannot be graded
  assert.throws(() => E.gradeCourse({ components: [{ type: 'theory', weightInCourse: 100, config: cfg(40, 60), ca: [], esa: [{ marks: 1, maxMarks: 10 }] }], policy: policy() }), { code: 'CA_NOT_CONFIGURED' });
});

test('GPA = sum(gp*credits)/sum(credits) with rules from the policy', () => {
  const recs = [
    { course: 'c1', credits: 3, gradePoint: 4, passed: true },
    { course: 'c2', credits: 2, gradePoint: 3, passed: true },
    { course: 'c3', credits: 1, gradePoint: 0, passed: false },
  ];
  assert.deepEqual(E.gpa(recs, {}), { gpa: 3, credits: 6, counted: 3 }); // (12+6+0)/6
  assert.equal(E.gpa(recs, { countFailedCredits: false }).gpa, 3.6); // (12+6)/5
  assert.equal(E.gpa(recs, { excludeCourseTypes: ['C'] }).gpa, 3);
  assert.equal(E.gpa([{ ...recs[0], courseType: 'C' }, recs[1]], { excludeCourseTypes: ['C'] }).gpa, 3);
  assert.equal(E.gpa([{ course: 'x', credits: 3, gradePoint: 3.333333, passed: true }, { course: 'y', credits: 3, gradePoint: 3.3, passed: true }], { gpaDecimals: 2, gpaRounding: 'half_up' }).gpa, 3.32);
  assert.throws(() => E.gpa(recs, { gpaDecimals: 2 }), { code: 'ROUNDING_NOT_CONFIGURED' });
  assert.deepEqual(E.gpa([], {}), { gpa: null, credits: 0, counted: 0 });
  assert.equal(E.gpa([{ ...recs[0], includeInGpa: false }, recs[1]], {}).gpa, 3);
});

test('repeated courses need an explicit policy: best / latest / all', () => {
  const recs = [
    { course: 'c1', credits: 3, gradePoint: 1, passed: true, attempt: 1 },
    { course: 'c1', credits: 3, gradePoint: 3, passed: true, attempt: 2 },
    { course: 'c2', credits: 3, gradePoint: 4, passed: true, attempt: 1 },
  ];
  assert.throws(() => E.gpa(recs, {}), { code: 'GPA_RULE_NOT_CONFIGURED' });
  assert.equal(E.gpa(recs, { repeatHandling: 'best' }).gpa, 3.5);
  assert.equal(E.gpa([{ ...recs[0], gradePoint: 4 }, recs[1], recs[2]], { repeatHandling: 'latest' }).gpa, 3.5);
  assert.equal(E.gpa([{ ...recs[0], gradePoint: 4 }, recs[1], recs[2]], { repeatHandling: 'best' }).gpa, 4);
  assert.equal(E.gpa(recs, { repeatHandling: 'all' }).counted, 3);
});
