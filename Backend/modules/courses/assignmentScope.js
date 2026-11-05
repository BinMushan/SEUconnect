/**
 * "assigned" data scope: a lecturer / demonstrator only reaches the offerings (and components) they are
 * actively assigned to. Shared by registration, attendance, assessment and result modules.
 */
const { CourseStaffAssignment } = require('./model');
const { forbidden } = require('../../core/http');

/** Active assignments of the caller: [{ offering, componentType, role }] */
const myAssignments = async (req, session) => {
  if (!req.access.staffId) return [];
  let q = CourseStaffAssignment.find({ staff: req.access.staffId, active: true }).lean();
  if (session) q = q.session(session);
  return q;
};

const assignedOfferingIds = async (req, session) => [...new Set((await myAssignments(req, session)).map((a) => String(a.offering)))];

/**
 * Throws unless the caller may work on `offeringId` / `componentType`.
 * Scopes wider than "assigned" (department / faculty / system) are not restricted here; department
 * checks for those are done by the caller with core/scope.assertDepartment.
 */
const assertAssigned = async (req, offeringId, componentType, session) => {
  if (['department', 'faculty', 'system'].includes(req.access.scope)) return;
  const mine = await myAssignments(req, session);
  const ok = mine.some((a) => String(a.offering) === String(offeringId) && (!componentType || a.componentType === componentType));
  if (!ok) throw forbidden('You are not assigned to this course offering.', 'NOT_ASSIGNED');
};

module.exports = { myAssignments, assignedOfferingIds, assertAssigned };
