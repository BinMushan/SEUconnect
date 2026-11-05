const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getStats, getBatchStats, getWorkflowReport } = require('../controllers/statsController');

router.use(authenticate);
router.get('/', getStats);
router.get('/batches', getBatchStats);
router.get('/workflows', getWorkflowReport);

module.exports = router;
