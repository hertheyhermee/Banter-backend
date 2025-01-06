import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import dotenv from 'dotenv'

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Google OAuth callback
export const googleOAuthCallback = async (req, res) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: req.user.id });

    if (!user) {
      // Create a new user with OAuth flag
      user = new User({
        username: req.user.displayName,
        email: req.user.emails[0].value,
        googleId: req.user.id,
        oauth: true,
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
