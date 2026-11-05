/**
 * SAR-specific endpoints. The SAR may only act at SAR stages (ECA/ESA verification,
 * Examination Form administrative verification, Examination Medical Faculty Board / Dean Office
 * stage, and the admission / Senate copy outputs). Every check is delegated to the engine.
 */
const store = require('../store');
const engine = require('../workflows/engine');
const { getWorkflow } = require('../workflows/definitions');
const { dispatch } = require('./notificationController');
const { fail, loadVisible, respond } = require('./processController');

/** POST /:id/remark - SAR administrative remark (no change to routing). */
exports.addAdministrativeRemark = async (req, res) => {
  try {
    const remark = String(req.body.remark || '').trim();
    if (!remark) return res.status(400).json({ success: false, message: 'Administrative remark content is required.' });
    const process = await loadVisible(req, res);
    if (!process) return;
    if (process.type === 'subject_medical') {
      return res.status(403).json({ success: false, message: 'Subject Medical has no SAR step.' });
    }
    const actor = engine.actorOf(req.user);
    const check = req.body.documentCheckStatus ? ` [Doc Check: ${req.body.documentCheckStatus}]` : '';
    process.auditLog.push({
      action: 'ADMIN_REMARK',
      actorName: actor.name,
      actorRole: actor.roleLabel,
      actorEmail: actor.email,
      timestamp: new Date(),
      stage: 'SAR Administrative Remark',
      comment: `${remark}${check}`,
    });
    await store.processes.save(process);
    respond(res, process, req.user, 'Administrative remark recorded.');
  } catch (error) {
    fail(res, error, 'Server error saving administrative remark');
  }
};

/** POST /:id/clarification - SAR returns the application to the student with listed deficiencies. */
exports.requestClarification = async (req, res) => {
  try {
    const process = await loadVisible(req, res);
    if (!process) return;
    const issues = Array.isArray(req.body.issuesIdentified) && req.body.issuesIdentified.length ? `[Deficiencies: ${req.body.issuesIdentified.join(', ')}] ` : '';
    const { events } = engine.returnForCorrection(process, req.user, req.body.notes, { prefix: issues });
    await store.processes.save(process);
    await dispatch(events);
    respond(res, process, req.user, 'Application returned to the student for correction.');
  } catch (error) {
    fail(res, error, 'Server error requesting clarification');
  }
};

/** PUT /:id/sar/verify-forward - complete the SAR stage and forward to the Examination Branch. */
exports.sarVerifyAndForward = async (req, res) => {
  try {
    const process = await loadVisible(req, res);
    if (!process) return;
    const stage = engine.currentStageOf(process);
    const wf = getWorkflow(process.type);
    const next = process.stages[process.currentStageIndex + 1];
    if (!wf || !stage || stage.role !== 'sar' || !next || next.role !== 'examination') {
      return res.status(409).json({ success: false, message: 'This application is not at a SAR verification step that forwards to the Examination Branch.' });
    }
    const { events } = engine.approve(process, req.user, { remarks: req.body.remarks });
    await store.processes.save(process);
    await dispatch(events);
    respond(res, process, req.user, 'Application verified and forwarded to the Examination Branch.');
  } catch (error) {
    fail(res, error, 'Server error forwarding to Examination Branch');
  }
};

/** PUT /:id/sar/process-admission - Dean Office Admission (Examination Section). */
exports.sarProcessAdmission = async (req, res) => {
  try {
    const process = await loadVisible(req, res);
    if (!process) return;
    const { events } = engine.issueAdmission(process, req.user, req.body);
    await store.processes.save(process);
    await dispatch(events);
    respond(res, process, req.user, 'Dean Office Admission (Examination Section) issued.');
  } catch (error) {
    fail(res, error, 'Server error generating admission');
  }
};

/** PUT /:id/sar/track-senate-copy - prepare and/or submit the Senate copy. */
exports.sarTrackSenateCopy = async (req, res) => {
  try {
    const process = await loadVisible(req, res);
    if (!process) return;
    const { events } = engine.trackSenateCopy(process, req.user, {
      trackingNo: req.body.trackingNo,
      note: req.body.submissionNote || req.body.note,
      phase: req.body.phase,
    });
    await store.processes.save(process);
    await dispatch(events);
    respond(res, process, req.user, process.senateCopy?.submittedAt ? 'Senate copy submitted and tracked.' : 'Senate copy marked as prepared.');
  } catch (error) {
    fail(res, error, 'Server error tracking Senate copy');
  }
};
