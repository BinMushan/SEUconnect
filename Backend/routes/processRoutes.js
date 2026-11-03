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
} = require('../controllers/sarController');

router.get('/', getAllProcesses);
router.get('/:id', getProcessById);
router.post('/', createProcess);
router.put('/:id/approve', approveStage);
router.put('/:id/decline', declineProcess);
router.post('/:id/comment', addComment);

// SAR Administrative Operations
router.post('/:id/remark', addAdministrativeRemark);
router.post('/:id/clarification', requestClarification);
router.post('/:id/route', routeRequest);

module.exports = router;
