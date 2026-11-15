const express = require('express');
const { body } = require('express-validator');
const {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTeachers)
  .post(
    authorize('admin'),
    [
      body('name').notEmpty().withMessage('Teacher name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('department').notEmpty().withMessage('Department is required'),
      validateRequest,
    ],
    createTeacher
  );

router
  .route('/:id')
  .get(getTeacherById)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

module.exports = router;
