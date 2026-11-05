const { test } = require('node:test');
const assert = require('node:assert/strict');
const { summarise } = require('../../modules/attendance/attendanceMath');

const rec = (componentType, status, n = 1) => Array.from({ length: n }, () => ({ componentType, status }));

test('counts and percentage for theory and practical separately', () => {
  const records = [...rec('theory', 'present', 8), ...rec('theory', 'absent', 2), ...rec('practical', 'present', 3), ...rec('practical', 'absent', 1)];
  const s = summarise(records, { minPercent: 75, excusedCountsAsPresent: true });
  assert.equal(s.total, 14);
  assert.equal(s.present, 11);
  assert.equal(s.theory.percentage, 80);
  assert.equal(s.practical.percentage, 75);
  assert.equal(s.percentage, 78.57);
  assert.equal(s.eligibility, 'eligible');
});

test('eligibility needs the policy: no threshold -> policy_not_configured (never assumes a number)', () => {
  const s = summarise(rec('theory', 'present', 10), {});
  assert.equal(s.eligibility, 'policy_not_configured');
  assert.equal(s.percentage, 100); // the percentage itself is still reported
});

test('Excused is a policy decision: unresolved policy hides the percentage instead of guessing', () => {
  const records = [...rec('theory', 'present', 6), ...rec('theory', 'excused', 2), ...rec('theory', 'absent', 2)];
  const unknown = summarise(records, { minPercent: 70 });
  assert.equal(unknown.percentage, null);
  assert.equal(unknown.excused, 2);
  assert.equal(unknown.eligibility, 'policy_not_configured');
  assert.equal(summarise(records, { minPercent: 70, excusedCountsAsPresent: true }).percentage, 80);
  assert.equal(summarise(records, { minPercent: 70, excusedCountsAsPresent: false }).percentage, 60);
  assert.equal(summarise(records, { minPercent: 70, excusedCountsAsPresent: false }).eligibility, 'ineligible');
  assert.equal(summarise(records, { minPercent: 70, excusedCountsAsPresent: true }).eligibility, 'eligible');
});

test('exact boundary: the minimum itself is eligible, just below is not', () => {
  const at = summarise([...rec('theory', 'present', 4), ...rec('theory', 'absent', 1)], { minPercent: 80, excusedCountsAsPresent: false });
  assert.equal(at.eligibility, 'eligible');
  const below = summarise([...rec('theory', 'present', 79), ...rec('theory', 'absent', 21)], { minPercent: 79.5, excusedCountsAsPresent: false });
  assert.equal(below.eligibility, 'ineligible');
  // 2/3 = 66.666...: shown as 66.67 but judged on the exact value
  const third = summarise([...rec('theory', 'present', 2), ...rec('theory', 'absent', 1)], { minPercent: 66.67, excusedCountsAsPresent: false });
  assert.equal(third.percentage, 66.67);
  assert.equal(third.eligibility, 'ineligible');
});

test('per-component thresholds (theory and practical judged separately)', () => {
  const records = [...rec('theory', 'present', 9), ...rec('theory', 'absent', 1), ...rec('practical', 'present', 1), ...rec('practical', 'absent', 1)];
  const s = summarise(records, { minPercent: { theory: 80, practical: 80 }, excusedCountsAsPresent: false });
  assert.equal(s.eligibility, 'ineligible');
  assert.equal(s.eligibilityDetail.theory.ok, true);
  assert.equal(s.eligibilityDetail.practical.ok, false);
  // a threshold for a component that has no sessions is ignored
  const onlyTheory = summarise(rec('theory', 'present', 5), { minPercent: { theory: 80, practical: 80 }, excusedCountsAsPresent: false });
  assert.equal(onlyTheory.eligibility, 'eligible');
});

test('no conducted sessions', () => {
  const s = summarise([], { minPercent: 80, excusedCountsAsPresent: true });
  assert.equal(s.total, 0);
  assert.equal(s.percentage, null);
  assert.equal(s.eligibility, 'no_sessions');
});
