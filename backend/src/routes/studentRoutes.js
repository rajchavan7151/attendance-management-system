const express = require('express');
const { body } = require('express-validator');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getStudents)
  .post(
    authorize('admin'),
    [
      body('name').notEmpty().withMessage('Student name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('rollNumber').notEmpty().withMessage('Roll number is required'),
      body('class').isMongoId().withMessage('Valid class ID is required'),
      validateRequest,
    ],
    createStudent
  );

router
  .route('/:id')
  .get(getStudentById)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

module.exports = router;
