const express = require('express');
const router = express.Router();
const { getAllStudents, deleteStudent, deleteBulkStudents, updateProfile, changePassword, getBatchStats, getStudentsByBatch } = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin routes
router.get('/stats/batches', protect, adminOnly, getBatchStats);
router.get('/batch/:batchName', protect, adminOnly, getStudentsByBatch);
router.get('/', protect, adminOnly, getAllStudents);
router.delete('/bulk', protect, adminOnly, deleteBulkStudents);
router.delete('/:id', protect, adminOnly, deleteStudent);

// Student self-profile update
router.put('/me/profile', protect, updateProfile);
router.put('/me/password', protect, changePassword);

module.exports = router;
