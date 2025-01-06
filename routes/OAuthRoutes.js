import express from 'express';
import passport from '../config/passport.js';
import { googleOAuthCallback } from '../controllers/Auth/authOAuthController.js';

const router = express.Router();

// Redirect to Google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleOAuthCallback
);

export default router;