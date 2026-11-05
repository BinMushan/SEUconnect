/**
 * Result calculation engine - PURE (no database, no I/O). All arithmetic uses decimal.js.
 *
 * Nothing academic is hard-coded here: weights come from the offering's AssessmentConfiguration, grade bands,
 * rounding and GPA rules come from the active GradePolicy that the caller passes in. When a rule that would
 * otherwise have to be guessed is missing, the engine throws a ResultEngineError instead of choosing a default.
 */
const Decimal = require('decimal.js');

class ResultEngineError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = 'ResultEngineError';
    this.code = code;
    this.details = details;
  }
}

const D = (v) => new Decimal(v);
const toNumber = (d) => d.toNumber();

const ROUNDING = {
  half_up: Decimal.ROUND_HALF_UP,
  half_down: Decimal.ROUND_HALF_DOWN,
  half_even: Decimal.ROUND_HALF_EVEN,
  down: Decimal.ROUND_DOWN,
  up: Decimal.ROUND_UP,
  floor: Decimal.ROUND_FLOOR,
  ceil: Decimal.ROUND_CEIL,
};
const ROUNDING_MODES = Object.keys(ROUNDING);

/** Applies a rounding rule { mode, decimals } (null/undefined = keep the exact value). */
const round = (value, rule) => {
  if (!rule || rule.decimals === undefined || rule.decimals === null) return value;
  if (!rule.mode || !ROUNDING[rule.mode]) throw new ResultEngineError('ROUNDING_NOT_CONFIGURED', 'A rounding mode is required whenever decimals are configured.');
  return value.toDecimalPlaces(rule.decimals, ROUNDING[rule.mode]);
};

// Rounding in the policy applies to the listed targets (default: both component and course marks).
const roundsTarget = (rounding, target) => Boolean(rounding) && (!Array.isArray(rounding.applyTo) || rounding.applyTo.includes(target));

const sumIs100 = (values) => values.reduce((acc, v) => acc.plus(D(v)), D(0)).equals(100);

const validateWeights = (caWeight, esaWeight) => {
  if (caWeight < 0 || esaWeight < 0 || !sumIs100([caWeight, esaWeight])) {
    throw new ResultEngineError('WEIGHTS_INVALID', 'CA and ESA weights must be non-negative and add up to 100.', { caWeight, esaWeight });
  }
};

const validateComponentWeights = (weights) => {
  if (!weights.length || weights.some((w) => w < 0) || !sumIs100(weights)) {
    throw new ResultEngineError('COMPONENT_WEIGHTS_INVALID', 'Component weights in the course must add up to 100.', { weights });
  }
};

const checkMark = (item, label) => {
  if (item.absent) return D(0);
  if (item.marks === null || item.marks === undefined) throw new ResultEngineError('MARK_MISSING', `A mark is missing for ${label}.`, { item: label });
  const marks = D(item.marks);
  const max = D(item.maxMarks);
  if (max.lte(0)) throw new ResultEngineError('MAX_MARKS_INVALID', `Maximum marks must be positive for ${label}.`);
  if (marks.lt(0) || marks.gt(max)) throw new ResultEngineError('MARK_OUT_OF_RANGE', `The mark for ${label} is outside 0..${item.maxMarks}.`, { marks: item.marks });
  return marks;
};

/** CA percentage = sum(marks/max * weight) / sum(weight) * 100. items: [{ name, marks, maxMarks, weight, absent }] */
const caPercent = (items) => {
  if (!items || !items.length) throw new ResultEngineError('CA_NOT_CONFIGURED', 'No CA assessments exist for this component.');
  let weighted = D(0);
  let totalWeight = D(0);
  for (const it of items) {
    const w = D(it.weight);
    if (w.lte(0)) throw new ResultEngineError('ASSESSMENT_WEIGHT_INVALID', `Assessment "${it.name}" needs a positive weight.`);
    const marks = checkMark(it, `assessment "${it.name}"`);
    weighted = weighted.plus(marks.div(D(it.maxMarks)).times(w));
    totalWeight = totalWeight.plus(w);
  }
  return weighted.div(totalWeight).times(100);
};

/** ESA percentage over one or several ESA records of a component: sum(marks) / sum(max) * 100. */
const esaPercent = (items) => {
  if (!items || !items.length) throw new ResultEngineError('ESA_NOT_CONFIGURED', 'No ESA exists for this component.');
  let got = D(0);
  let max = D(0);
  for (const it of items) {
    got = got.plus(checkMark(it, `ESA "${it.name || 'exam'}"`));
    max = max.plus(D(it.maxMarks));
  }
  if (max.lte(0)) throw new ResultEngineError('MAX_MARKS_INVALID', 'ESA maximum marks must be positive.');
  return got.div(max).times(100);
};

/**
 * One component (theory / practical).
 *   mark = (CA% * caWeight + ESA% * esaWeight) / 100
 * config: { caWeight, esaWeight, minCaPercent, minEsaPercent, minFinalPercent }  (null minimum = not enforced)
 */
const component = ({ ca, esa, config, rounding }) => {
  validateWeights(config.caWeight, config.esaWeight);
  const caW = D(config.caWeight);
  const esaW = D(config.esaWeight);
  if (caW.gt(0) && (ca === null || ca === undefined)) throw new ResultEngineError('CA_NOT_CONFIGURED', 'The CA percentage is required by this configuration.');
  if (esaW.gt(0) && (esa === null || esa === undefined)) throw new ResultEngineError('ESA_NOT_CONFIGURED', 'The ESA percentage is required by this configuration.');
  const caP = caW.gt(0) ? D(ca) : null;
  const esaP = esaW.gt(0) ? D(esa) : null;
  let mark = (caP ? caP.times(caW) : D(0)).plus(esaP ? esaP.times(esaW) : D(0)).div(100);
  if (roundsTarget(rounding, 'componentMark')) mark = round(mark, rounding);

  const enforced = (v) => v !== null && v !== undefined;
  const caPassed = !caP || !enforced(config.minCaPercent) || caP.gte(D(config.minCaPercent));
  const esaPassed = !esaP || !enforced(config.minEsaPercent) || esaP.gte(D(config.minEsaPercent));
  const finalPassed = !enforced(config.minFinalPercent) || mark.gte(D(config.minFinalPercent));
  return {
    caPercent: caP ? toNumber(caP) : null,
    esaPercent: esaP ? toNumber(esaP) : null,
    mark: toNumber(mark),
    caPassed,
    esaPassed,
    finalPassed,
    passed: caPassed && esaPassed && finalPassed,
  };
};

/** Course mark = sum(componentMark * weightInCourse) / 100. */
const course = ({ components, rounding }) => {
  validateComponentWeights(components.map((c) => c.weightInCourse));
  let mark = components.reduce((acc, c) => acc.plus(D(c.mark).times(D(c.weightInCourse))), D(0)).div(100);
  if (roundsTarget(rounding, 'courseMark')) mark = round(mark, rounding);
  return { mark: toNumber(mark), allComponentsPassed: components.every((c) => c.passed) };
};

/** Looks the mark up in the policy bands (min and max inclusive). Never invents a band. */
const grade = (mark, policy) => {
  if (!policy || !Array.isArray(policy.bands) || !policy.bands.length) {
    throw new ResultEngineError('GRADE_POLICY_NOT_CONFIGURED', 'No active grade policy is available. An authorised officer must approve one before results can be calculated.');
  }
  const m = D(mark);
  const band = policy.bands.find((b) => m.gte(D(b.min)) && m.lte(D(b.max)));
  if (!band) throw new ResultEngineError('GRADE_BAND_NOT_FOUND', `No grade band of the active policy covers the mark ${mark}.`, { mark });
  return { grade: band.grade, gradePoint: band.gradePoint, fail: Boolean(band.fail) };
};

/**
 * Full course result.
 * components: [{ type, weightInCourse, config, ca:[assessment items], esa:[esa items] }]
 * policy: GradePolicy-like { bands, rounding, passRule }   passRule: 'all_components' (default) | 'course_mark_only'
 */
const gradeCourse = ({ components, policy }) => {
  if (!policy) throw new ResultEngineError('GRADE_POLICY_NOT_CONFIGURED', 'No active grade policy is available.');
  const rounding = policy.rounding;
  const results = components.map((c) => {
    const caNeeded = D(c.config.caWeight).gt(0);
    const esaNeeded = D(c.config.esaWeight).gt(0);
    const r = component({ ca: caNeeded ? toNumber(caPercent(c.ca)) : null, esa: esaNeeded ? toNumber(esaPercent(c.esa)) : null, config: c.config, rounding });
    return { type: c.type, weightInCourse: c.weightInCourse, ...r };
  });
  const courseResult = course({ components: results, rounding });
  const g = grade(courseResult.mark, policy);
  const passRule = policy.passRule || 'all_components';
  const passed = !g.fail && (passRule === 'course_mark_only' ? true : courseResult.allComponentsPassed);
  return { components: results, finalMark: courseResult.mark, grade: g.grade, gradePoint: g.gradePoint, passed };
};

/**
 * GPA = sum(gradePoint * credits) / sum(credits).
 * records: [{ course, credits, gradePoint, passed, includeInGpa, attempt, courseType }]
 * rules:   { repeatHandling: 'best'|'latest'|'all', excludeCourseTypes: [], countFailedCredits (default true), gpaDecimals, gpaRounding }
 */
const gpa = (records, rules = {}) => {
  let list = records.filter((r) => r.includeInGpa !== false && !(rules.excludeCourseTypes || []).includes(r.courseType));
  if (rules.countFailedCredits === false) list = list.filter((r) => r.passed);

  const byCourse = new Map();
  for (const r of list) byCourse.set(String(r.course), [...(byCourse.get(String(r.course)) || []), r]);
  const repeated = [...byCourse.values()].some((v) => v.length > 1);
  if (repeated) {
    if (!['best', 'latest', 'all'].includes(rules.repeatHandling)) {
      throw new ResultEngineError('GPA_RULE_NOT_CONFIGURED', 'The student has repeated courses but the grade policy does not say how repeats are counted (gpaRules.repeatHandling).');
    }
    if (rules.repeatHandling !== 'all') {
      list = [...byCourse.values()].map((attempts) =>
        rules.repeatHandling === 'best'
          ? attempts.reduce((a, b) => (D(b.gradePoint).gt(D(a.gradePoint)) ? b : a))
          : attempts.reduce((a, b) => ((b.attempt || 0) >= (a.attempt || 0) ? b : a))
      );
    }
  }
  const credits = list.reduce((acc, r) => acc.plus(D(r.credits)), D(0));
  if (credits.isZero()) return { gpa: null, credits: 0, counted: 0 };
  let value = list.reduce((acc, r) => acc.plus(D(r.gradePoint).times(D(r.credits))), D(0)).div(credits);
  if (rules.gpaDecimals !== undefined && rules.gpaDecimals !== null) value = round(value, { decimals: rules.gpaDecimals, mode: rules.gpaRounding });
  return { gpa: toNumber(value), credits: toNumber(credits), counted: list.length };
};

/** Validates policy bands: min <= max, no overlaps. Returns nothing, throws on problems. */
const validateBands = (bands) => {
  if (!Array.isArray(bands) || !bands.length) throw new ResultEngineError('BANDS_INVALID', 'At least one grade band is required.');
  const sorted = [...bands].sort((a, b) => D(a.min).cmp(D(b.min)));
  sorted.forEach((b, i) => {
    if (D(b.min).gt(D(b.max))) throw new ResultEngineError('BANDS_INVALID', `Band ${b.grade}: min is greater than max.`);
    if (i > 0 && D(b.min).lte(D(sorted[i - 1].max))) throw new ResultEngineError('BANDS_INVALID', `Bands ${sorted[i - 1].grade} and ${b.grade} overlap.`);
  });
};

module.exports = { ResultEngineError, ROUNDING_MODES, round, validateWeights, validateComponentWeights, caPercent, esaPercent, component, course, grade, gradeCourse, gpa, validateBands };
