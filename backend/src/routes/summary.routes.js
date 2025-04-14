const express = require('express');
const summaryController = require('../controllers/summary.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Summary routes
router.post('/', summaryController.generateSummary);
router.get('/', summaryController.getUserSummaries);
router.get('/:id', summaryController.getSummaryById);
router.delete('/:id', summaryController.deleteSummary);
router.put('/:id', summaryController.updateSummary);

module.exports = router;
