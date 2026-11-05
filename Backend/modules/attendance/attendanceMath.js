/**
 * Attendance arithmetic - PURE (no database).
 *
 * Two academic rules are NOT assumed here and must come from policy:
 *   - how an Excused session counts            -> policy.excusedCountsAsPresent (true | false)
 *   - the minimum attendance for eligibility  -> policy.minPercent (number, or { overall, theory, practical })
 * If a needed rule is missing the result says 'policy_not_configured' (percentages that depend on it are null).
 */
const Decimal = require('decimal.js');

const pct = (attended, total) => (total === 0 ? null : new Decimal(attended).div(total).times(100));
const display = (d) => (d === null ? null : d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()); // presentation only

const tally = (records) => {
  const t = { total: 0, present: 0, absent: 0, excused: 0 };
  for (const r of records) {
    t.total += 1;
    if (r.status === 'present') t.present += 1;
    else if (r.status === 'excused') t.excused += 1;
    else t.absent += 1;
  }
  return t;
};

const block = (records, excusedCountsAsPresent) => {
  const t = tally(records);
  // The percentage is only unambiguous when the policy is known or no session was excused.
  const resolvable = t.excused === 0 || typeof excusedCountsAsPresent === 'boolean';
  const attended = resolvable ? t.present + (excusedCountsAsPresent ? t.excused : 0) : null;
  const exact = resolvable ? pct(attended, t.total) : null;
  return { ...t, attended, percentage: display(exact), percentageExact: exact === null ? null : exact.toString(), _exact: exact };
};

const clean = ({ _exact, ...rest }) => rest;

/**
 * summarise(records, policy)  records: [{ componentType: 'theory'|'practical', status: 'present'|'absent'|'excused' }]
 * Only CONDUCTED sessions should be passed in.
 */
const summarise = (records, policy = {}) => {
  const { minPercent, excusedCountsAsPresent } = policy;
  const overall = block(records, excusedCountsAsPresent);
  const theory = block(records.filter((r) => r.componentType === 'theory'), excusedCountsAsPresent);
  const practical = block(records.filter((r) => r.componentType === 'practical'), excusedCountsAsPresent);

  let eligibility;
  let detail = {};
  if (minPercent === undefined || minPercent === null || (overall.excused > 0 && typeof excusedCountsAsPresent !== 'boolean')) {
    eligibility = 'policy_not_configured';
  } else if (overall.total === 0) {
    eligibility = 'no_sessions';
  } else {
    const thresholds = typeof minPercent === 'number' ? { overall: minPercent } : minPercent;
    const blocks = { overall, theory, practical };
    const checks = [];
    for (const [key, min] of Object.entries(thresholds)) {
      const b = blocks[key];
      if (!b || b.total === 0 || min === null || min === undefined) continue; // nothing to judge for that part
      const ok = b._exact.gte(new Decimal(min));
      detail[key] = { required: min, actual: b.percentage, ok };
      checks.push(ok);
    }
    eligibility = checks.length === 0 ? 'no_sessions' : checks.every(Boolean) ? 'eligible' : 'ineligible';
  }
  return { ...clean(overall), theory: clean(theory), practical: clean(practical), eligibility, eligibilityDetail: detail };
};

module.exports = { summarise, tally };
