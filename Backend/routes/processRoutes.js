const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const p = require('../controllers/processController');
const sar = require('../controllers/sarController');

const STAFF = ['lecturer', 'hod', 'dean', 'sar', 'examination', 'dept_ma', 'fma', 'admin', 'superadmin'];
const WORKFLOW_ACTORS = ['lecturer', 'hod', 'dean', 'sar', 'examination', 'dept_ma', 'fma'];

router.use(authenticate);

router.get('/', p.getAllProcesses);

// Portal-level routes (must be declared before "/:id")
router.get('/portal/form-availability', p.getFormAvailability);
router.post('/portal/form-availability', authorize('sar'), p.toggleFormAvailability);
router.post('/portal/forward-dept-list', authorize('examination'), p.dispatchDepartmentList);
router.post('/department-lists/dispatch', authorize('examination'), p.dispatchDepartmentList);
router.get('/department-lists', authorize(...STAFF), p.getDepartmentLists);

router.post('/', authorize('student'), p.createProcess);
router.get('/:id', p.getProcessById);
router.get('/:id/receipt', p.getReceipt);
router.put('/:id/resubmit', authorize('student'), p.resubmitProcess);

// Stage actions - the engine additionally checks that the caller owns the current stage.
router.put('/:id/approve', authorize(...WORKFLOW_ACTORS), p.approveStage);
router.put('/:id/decline', authorize(...WORKFLOW_ACTORS), p.declineProcess);
router.put('/:id/return', authorize(...WORKFLOW_ACTORS), p.returnProcess);
router.post('/:id/comment', p.addComment);

// SAR-only endpoints
router.post('/:id/remark', authorize('sar'), sar.addAdministrativeRemark);
router.post('/:id/clarification', authorize('sar'), sar.requestClarification);
router.put('/:id/sar/verify-forward', authorize('sar'), sar.sarVerifyAndForward);
router.put('/:id/sar/process-admission', authorize('sar'), sar.sarProcessAdmission);
router.put('/:id/sar/track-senate-copy', authorize('sar'), sar.sarTrackSenateCopy);

module.exports = router;
