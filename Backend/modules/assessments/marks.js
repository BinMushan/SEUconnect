/**
 * Shared mark-entry logic for CA (StudentAssessmentMark) and ESA (ESAMark).
 * Every write appends to the mark's history; changing an existing mark needs a reason.
 */
const { ApiError, unprocessable } = require('../../core/http');

const validateItem = (item, maxMarks) => {
  if (item.absent) {
    if (item.marks !== undefined && item.marks !== null) throw unprocessable('An absent student cannot also have a mark.', { student: item.student }, 'ABSENT_WITH_MARK');
    return;
  }
  if (typeof item.marks !== 'number' || Number.isNaN(item.marks)) throw unprocessable('A mark (or absent:true) is required for every student.', { student: item.student }, 'MARK_REQUIRED');
  if (item.marks < 0 || item.marks > maxMarks) throw new ApiError(422, 'MARK_OUT_OF_RANGE', `Marks must be between 0 and ${maxMarks}.`, { student: item.student, marks: item.marks, maxMarks });
};

/**
 * applyMarks({ MarkModel, parentField, parent, items, allowedStudents, maxMarks, req, session, extra })
 * items: [{ student, marks?, absent?, reason? }]. Returns { created, updated, unchanged, changes }.
 */
const applyMarks = async ({ MarkModel, parentField, parent, items, allowedStudents, maxMarks, req, session, extra = () => ({}) }) => {
  const seen = new Set();
  const out = { created: 0, updated: 0, unchanged: 0, changes: [] };
  for (const item of items) {
    const sid = String(item.student);
    if (seen.has(sid)) throw unprocessable('A student appears twice in the request.', { student: sid }, 'DUPLICATE_STUDENT');
    seen.add(sid);
    if (!allowedStudents.has(sid)) throw unprocessable('The student does not have an approved registration for this offering.', { student: sid }, 'STUDENT_NOT_REGISTERED');
    validateItem(item, maxMarks);
  }
  for (const item of items) {
    const sid = String(item.student);
    const marks = item.absent ? null : item.marks;
    const absent = Boolean(item.absent);
    const existing = await MarkModel.findOne({ [parentField]: parent._id, student: sid }).session(session);
    if (existing) {
      const same = (existing.marks ?? null) === (marks ?? null) && Boolean(existing.absent) === absent;
      if (same) {
        out.unchanged += 1;
        continue;
      }
      if ((existing.marks !== null && existing.marks !== undefined) || existing.absent) {
        if (!(item.reason || '').trim()) throw unprocessable('A reason is required to change an entered mark.', { student: sid }, 'REASON_REQUIRED');
      }
      out.changes.push({ student: sid, from: { marks: existing.marks, absent: existing.absent }, to: { marks, absent } });
      existing.marks = marks;
      existing.absent = absent;
      existing.enteredBy = req.user.id;
      Object.assign(existing, extra(sid));
      existing.history.push({ marks, absent, at: new Date(), by: req.user.id, reason: item.reason || '' });
      await existing.save({ session });
      out.updated += 1;
    } else {
      await MarkModel.create([{ [parentField]: parent._id, student: sid, offering: parent.offering, componentType: parent.componentType, marks, absent, enteredBy: req.user.id, history: [{ marks, absent, at: new Date(), by: req.user.id, reason: item.reason || '' }], ...extra(sid) }], { session });
      out.changes.push({ student: sid, from: null, to: { marks, absent } });
      out.created += 1;
    }
  }
  return out;
};

/** Which registered students still have no mark / absent flag entered. */
const missingStudents = async ({ MarkModel, parentField, parent, registered, session }) => {
  const rows = await MarkModel.find({ [parentField]: parent._id }).session(session).lean();
  const done = new Set(rows.filter((r) => (r.marks !== null && r.marks !== undefined) || r.absent).map((r) => String(r.student)));
  return registered.filter((s) => !done.has(String(s)));
};

module.exports = { applyMarks, missingStudents };
