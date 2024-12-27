import express from 'express';
import passport from '../config/passport.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Redirect to Google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    // Check if user already exists
    let user = await User.findOne({ googleId: req.user.id });

    if (!user) {
      // Create a new user with oauth flag
      user = new User({
        username: req.user.displayName,
        email: req.user.emails[0].value,
        googleId: req.user.id,
        oauth: true
      });
      await user.save();
    }


    // Send token and user details to the client
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      message: 'Google OAuth successful',
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  }
);

export default router;