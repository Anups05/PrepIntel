const express = require('express');
const router = express.Router();
const { createTest, getAllTests, getTestById, updateTest, deleteTest, getTestStats, getAdminAnalytics, getBatchAnalytics, getBatchDetails, getAllQuestions, getQuestionBankAnalytics, getStudentTests, startTest, recordAttempt, getAttemptResult, getStudentAnalytics, getAllTestAttempts, getStudentStreak, getStudentWeakTopics, getStudentNotifications } = require('../controllers/testController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin stats routes (must be before /:id)
router.get('/stats/overview', protect, adminOnly, getTestStats);
router.get('/admin/analytics', protect, adminOnly, getAdminAnalytics);
router.get('/admin/batch-analytics', protect, adminOnly, getBatchAnalytics);
router.get('/admin/batch-details/:batchName', protect, adminOnly, getBatchDetails);
router.get('/questions/all', protect, adminOnly, getAllQuestions);
router.get('/questions/analytics', protect, adminOnly, getQuestionBankAnalytics);

// Student-facing routes
router.get('/student/my-tests', protect, getStudentTests);
router.get('/student/start/:id', protect, startTest);
router.post('/student/submit/:id', protect, recordAttempt);
router.get('/student/result/:id', protect, getAttemptResult);
router.get('/student/analytics', protect, getStudentAnalytics);
router.get('/student/test-history', protect, getAllTestAttempts);
router.get('/student/streak', protect, getStudentStreak);
router.get('/student/weak-topics', protect, getStudentWeakTopics);
router.get('/student/notifications', protect, getStudentNotifications);

// Admin CRUD
router.post('/', protect, adminOnly, createTest);
router.get('/', protect, adminOnly, getAllTests);
router.get('/:id', protect, adminOnly, getTestById);
router.put('/:id', protect, adminOnly, updateTest);
router.delete('/:id', protect, adminOnly, deleteTest);

module.exports = router;
