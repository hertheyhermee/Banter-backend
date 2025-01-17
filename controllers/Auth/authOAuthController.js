import jwt from 'jsonwebtoken';
import User from '../../models/user.js';
import dotenv from 'dotenv'

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Google OAuth callback
export const googleOAuthCallback = async (req, res) => {
  try {
    if (!req.user || !req.user.user.googleId) {
      return res.status(400).json({ message: 'User not authenticated' });
    }
    // Check if user already exists
    let user = await User.findOne({ googleId: req.user.user.googleId });

    console.log('User found:', user); // Debugging line to check the found user

      if (!user) {
      // Create a new user with OAuth flag
      user = new User({
        username: req.user.displayName,
        email: req.user.emails[0].value,
        googleId: req.user.id,
        oauth: true,
        password: undefined
      });
      user = await user.save();
    }

    // Generate a token for the user (existing or newly created)
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    
    // Send token and user details to the client
    res.json({
      message: 'Google OAuth successful',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
