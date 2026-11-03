const express = require('express');
const router = express.Router();
const {
  getAllProcesses,
  getProcessById,
  createProcess,
  approveStage,
  declineProcess,
  returnProcess,
  addComment,
} = require('../controllers/processController');

router.get('/', getAllProcesses);
router.get('/:id', getProcessById);
router.post('/', createProcess);
router.put('/:id/approve', approveStage);
router.put('/:id/decline', declineProcess);
router.put('/:id/return', returnProcess);
router.post('/:id/comment', addComment);

module.exports = router;
