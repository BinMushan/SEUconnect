const express = require('express');
const router = express.Router();
const { getStats, getBatchStats } = require('../controllers/statsController');

router.get('/', getStats);
router.get('/batches', getBatchStats);

module.exports = router;
