/**
 * Marks workflow shared by CA assessments and ESA schedules:
 *   draft/scheduled -> open -> submitted -> verified -> approved -> locked
 * Reviewers can send submitted/verified/approved marks back to "open" (reason required). Locked is final:
 * a locked item only changes through an approved correction (history kept).
 */
const { conflict, forbidden, unprocessable } = require('../../core/http');

const FLOW = {
  draft: ['open'],
  scheduled: ['open', 'cancelled'],
  open: ['submitted'],
  submitted: ['verified', 'open'],
  verified: ['approved', 'open'],
  approved: ['locked', 'open'],
  locked: [],
  cancelled: [],
};

/** Moves doc.status to `to` (validating the flow and segregation of duties) and records the step. */
const moveStatus = (doc, to, req, { reason } = {}) => {
  if (!(FLOW[doc.status] || []).includes(to)) {
    throw conflict(`A ${doc.status} item cannot become ${to}.`, { allowed: FLOW[doc.status] || [] }, 'INVALID_TRANSITION');
  }
  if (to === 'open' && ['submitted', 'verified', 'approved'].includes(doc.status) && !(reason || '').trim()) {
    throw unprocessable('A reason is required to send marks back for rework.', null, 'REASON_REQUIRED');
  }
  if (['verified', 'approved'].includes(to)) {
    const submitted = [...(doc.statusHistory || [])].reverse().find((h) => h.status === 'submitted');
    // the person who submitted the marks cannot also verify or approve them
    if (submitted && String(submitted.by) === String(req.user.id)) throw forbidden('Marks must be verified and approved by someone other than the person who submitted them.', 'SEGREGATION_OF_DUTIES');
  }
  doc.status = to;
  doc.statusHistory.push({ status: to, at: new Date(), by: req.user.id, reason: reason || '' });
};

const MARK_STATES_OPEN = ['open'];

module.exports = { FLOW, moveStatus, MARK_STATES_OPEN };
