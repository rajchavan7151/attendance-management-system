const express = require('express');
const { body } = require('express-validator');
const {
  login,
  getMe,
  getAllUsers,
  toggleUserStatus,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  login
);

router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
