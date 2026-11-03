const express = require('express');
const router = express.Router();
const {
  getAllProcesses,
  getProcessById,
  createProcess,
  approveStage,
  declineProcess,
  addComment,
} = require('../controllers/processController');
const {
  addAdministrativeRemark,
  requestClarification,
  routeRequest,
  sarVerifyAndForward,
  sarProcessAdmission,
  sarTrackSenateCopy,
  sarForwardDepartmentList,
  getFormAvailability,
  toggleFormAvailability,
} = require('../controllers/sarController');

router.get('/', getAllProcesses);

// SAR Portal Form Availability
router.get('/portal/form-availability', getFormAvailability);
router.post('/portal/form-availability', toggleFormAvailability);
router.post('/portal/forward-dept-list', sarForwardDepartmentList);

router.get('/:id', getProcessById);
router.post('/', createProcess);
router.put('/:id/approve', approveStage);
router.put('/:id/decline', declineProcess);
router.post('/:id/comment', addComment);

// SAR Administrative Workflow Endpoints
router.post('/:id/remark', addAdministrativeRemark);
router.post('/:id/clarification', requestClarification);
router.post('/:id/route', routeRequest);
router.put('/:id/sar/verify-forward', sarVerifyAndForward);
router.put('/:id/sar/process-admission', sarProcessAdmission);
router.put('/:id/sar/track-senate-copy', sarTrackSenateCopy);

module.exports = router;
