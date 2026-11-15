const express = require('express');
const { body } = require('express-validator');
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSubjects)
  .post(
    authorize('admin'),
    [
      body('name').notEmpty().withMessage('Subject name is required'),
      body('code').notEmpty().withMessage('Subject code is required'),
      body('class').isMongoId().withMessage('Valid Class ID is required'),
      validateRequest,
    ],
    createSubject
  );

router
  .route('/:id')
  .get(getSubjectById)
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

module.exports = router;
