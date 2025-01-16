import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../../models/User.js';
import dotenv from 'dotenv'

dotenv.config();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Register User
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password} = req.body; // Include googleId in the request body if available

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      oauth: false, // Set to false for normal signup
      googleId: null // Set googleId only if provided
    });

    console.log(newUser);
    

    await newUser.save(); 

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};