const express = require('express');
const { body } = require('express-validator');
const {
  markAttendance,
  getAttendanceRecords,
  updateAttendanceRecord,
  getStudentAttendanceSummary,
  getClassAttendanceReport,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/mark',
  authorize('teacher', 'admin'),
  [
    body('classId').isMongoId().withMessage('Valid Class ID is required'),
    body('subjectId').isMongoId().withMessage('Valid Subject ID is required'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid Date (YYYY-MM-DD) is required'),
    body('attendanceList').isArray({ min: 1 }).withMessage('attendanceList array must contain at least one item'),
    validateRequest,
  ],
  markAttendance
);

router.get('/', getAttendanceRecords);
router.put('/:id', authorize('teacher', 'admin'), updateAttendanceRecord);
router.get('/student-summary/:studentId?', getStudentAttendanceSummary);
router.get('/class-report/:classId', getClassAttendanceReport);

module.exports = router;
