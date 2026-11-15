const express = require('express');
const {
  getAdminStats,
  getTeacherStats,
  getStudentStats,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminStats);
router.get('/teacher', authorize('teacher', 'admin'), getTeacherStats);
router.get('/student', authorize('student', 'admin'), getStudentStats);

module.exports = router;
