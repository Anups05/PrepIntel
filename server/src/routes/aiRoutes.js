const express = require('express');
const router = express.Router();
const { getAIInsights, getStudentAIInsights } = require('../controllers/aiController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin AI Insights
router.get('/insights', protect, adminOnly, getAIInsights);

// Student personalized AI Insights
router.get('/student-insights', protect, getStudentAIInsights);

module.exports = router;
