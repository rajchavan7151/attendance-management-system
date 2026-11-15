const express = require('express');
const { body } = require('express-validator');
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getClasses)
  .post(
    authorize('admin'),
    [
      body('name').notEmpty().withMessage('Class name is required'),
      body('code').notEmpty().withMessage('Class code is required'),
      body('department').notEmpty().withMessage('Department is required'),
      body('semester').notEmpty().withMessage('Semester is required'),
      validateRequest,
    ],
    createClass
  );

router
  .route('/:id')
  .get(getClassById)
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

module.exports = router;
