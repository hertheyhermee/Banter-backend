import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, logoutUser } from '../controllers/Auth/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register Route
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  registerUser
);

// Login Route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginUser
);

// Logout Route
router.post('/logout', authMiddleware, logoutUser);

export default router;