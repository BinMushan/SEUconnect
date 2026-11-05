/**
 * Allocation engine - PURE (no database, no clock, no randomness). Same input -> same output.
 *
 * allocate({ applicants, capacities, policy, minApplications, countBasis }) -> result
 *
 *  applicants : [{ student, submittedAt, preferences:[specId,...], metrics:{key:number}, blocked?: 'REASON' }]
 *  capacities : { [specId]: seats }
 *  policy     : { criteria:[{ key, weight, direction:'desc'|'asc' }], tieBreakers?:[{ key, direction }], eligibility?:{ minValues:{ key:number } } }
 *  minApplications : number | null   (BBST "a majoring is offered only with at least N applications")
 *  countBasis : 'any_preference' | 'first_preference'
 *
 * Nothing here is an academic constant: weights, tie-breakers, eligibility thresholds and the minimum
 * application count all arrive as data. A student whose preferences are all unavailable is left
 * UNALLOCATED for manual review - the engine never assigns a track the student did not list.
 */
const { ApiError } = require('../../core/http');

const COUNT_BASES = ['any_preference', 'first_preference'];

const policyError = (message, details) => new ApiError(422, 'POLICY_NOT_CONFIGURED', message, details);

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

/** Validates and normalises the selection policy; throws POLICY_NOT_CONFIGURED when it is missing or malformed. */
const normalisePolicy = (policy) => {
  if (!policy || typeof policy !== 'object' || !Array.isArray(policy.criteria) || policy.criteria.length === 0) {
    throw policyError('The allocation selection policy (criteria and weights) has not been configured and approved.');
  }
  const criteria = policy.criteria.map((c, i) => {
    if (!c || typeof c.key !== 'string' || !c.key) throw policyError(`Criterion #${i + 1} has no metric key.`);
    if (!isNum(c.weight) || c.weight < 0) throw policyError(`Criterion "${c.key}" needs a non-negative numeric weight.`);
    const direction = c.direction || 'desc';
    if (!['asc', 'desc'].includes(direction)) throw policyError(`Criterion "${c.key}" has an invalid direction.`);
    return { key: c.key, weight: c.weight, direction };
  });
  if (!criteria.some((c) => c.weight > 0)) throw policyError('At least one criterion must have a weight above zero.');
  const tieBreakers = (policy.tieBreakers || []).map((t) => ({ key: t.key, direction: t.direction === 'asc' ? 'asc' : 'desc' }));
  const minValues = (policy.eligibility && policy.eligibility.minValues) || {};
  return { criteria, tieBreakers, minValues };
};

const toTime = (v) => (v instanceof Date ? v.getTime() : new Date(v).getTime());

// Rounded so that float noise never changes the order of equal scores.
const scoreOf = (metrics, criteria) => {
  let total = 0;
  for (const c of criteria) total += c.weight * (c.direction === 'asc' ? -metrics[c.key] : metrics[c.key]);
  return Math.round(total * 1e9) / 1e9;
};

const compareApplicants = (a, b, tieBreakers) => {
  if (a.score !== b.score) return b.score - a.score;
  for (const t of tieBreakers) {
    const av = isNum(a.metrics[t.key]) ? a.metrics[t.key] : null;
    const bv = isNum(b.metrics[t.key]) ? b.metrics[t.key] : null;
    if (av === bv) continue;
    if (av === null) return 1; // a missing tie-breaker value ranks last - never invented
    if (bv === null) return -1;
    return t.direction === 'asc' ? av - bv : bv - av;
  }
  if (a.time !== b.time) return a.time - b.time; // earlier application first
  return String(a.student) < String(b.student) ? -1 : String(a.student) > String(b.student) ? 1 : 0;
};

const allocate = ({ applicants, capacities, policy, minApplications = null, countBasis = 'any_preference' }) => {
  const pol = normalisePolicy(policy);
  if (!COUNT_BASES.includes(countBasis)) throw policyError(`countBasis must be one of ${COUNT_BASES.join(', ')}.`);
  if (minApplications !== null && (!isNum(minApplications) || minApplications < 0)) throw policyError('minApplications must be a non-negative number.');

  const ineligible = [];
  const pool = [];
  const required = [...pol.criteria.map((c) => c.key), ...Object.keys(pol.minValues)];

  for (const a of applicants) {
    if (a.blocked) {
      ineligible.push({ student: String(a.student), reason: a.blocked });
      continue;
    }
    const metrics = a.metrics || {};
    const missing = [...new Set(required)].find((k) => !isNum(metrics[k]));
    if (missing) {
      ineligible.push({ student: String(a.student), reason: `MISSING_METRIC:${missing}` });
      continue;
    }
    const below = Object.entries(pol.minValues).find(([k, min]) => metrics[k] < min);
    if (below) {
      ineligible.push({ student: String(a.student), reason: `BELOW_MINIMUM:${below[0]}` });
      continue;
    }
    pool.push({ student: String(a.student), time: toTime(a.submittedAt), metrics, preferences: (a.preferences || []).map(String), score: scoreOf(metrics, pol.criteria) });
  }

  // ---- offered tracks (seats > 0 and, where a minimum applies, enough applications) ----
  const offered = new Set(Object.keys(capacities).filter((s) => capacities[s] > 0));
  const notOffered = [];
  let iterations = 0;
  if (minApplications) {
    for (;;) {
      const counts = {};
      for (const s of offered) counts[s] = 0;
      for (const p of pool) {
        const prefs = p.preferences.filter((s) => offered.has(s));
        if (countBasis === 'first_preference') {
          if (prefs.length) counts[prefs[0]] += 1;
        } else {
          for (const s of new Set(prefs)) counts[s] += 1;
        }
      }
      // Remove one track at a time (the weakest) and re-evaluate: students then count towards their next preference.
      const below = [...offered].filter((s) => counts[s] < minApplications).sort((x, y) => counts[x] - counts[y] || (x < y ? -1 : 1));
      if (!below.length) break;
      offered.delete(below[0]);
      notOffered.push({ specialization: below[0], applications: counts[below[0]] });
      iterations += 1;
    }
  }

  // ---- rank ----
  const ranked = [...pool].sort((a, b) => compareApplicants(a, b, pol.tieBreakers));
  const ranking = ranked.map((p, i) => ({ student: p.student, rank: i + 1, score: p.score }));

  // ---- serial allocation in rank order, honouring preference order and capacity ----
  const remaining = {};
  for (const s of offered) remaining[s] = capacities[s];
  const allocations = [];
  const unallocated = [];
  ranked.forEach((p, i) => {
    const available = p.preferences.filter((s) => offered.has(s));
    const pick = available.find((s) => remaining[s] > 0);
    if (pick) {
      remaining[pick] -= 1;
      allocations.push({ student: p.student, specialization: pick, rank: i + 1, score: p.score, preferenceRank: p.preferences.indexOf(pick) + 1 });
    } else {
      unallocated.push({ student: p.student, rank: i + 1, reason: available.length ? 'ALL_PREFERENCES_FULL' : 'NO_OFFERED_PREFERENCE', manualReview: true });
    }
  });

  return {
    allocations,
    unallocated,
    ineligible,
    notOffered,
    ranking,
    seatsLeft: remaining,
    stats: { applicants: applicants.length, eligible: pool.length, allocated: allocations.length, unallocated: unallocated.length, ineligible: ineligible.length, iterations },
  };
};

module.exports = { allocate, normalisePolicy, COUNT_BASES };
