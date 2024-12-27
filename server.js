import express from 'express'
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import session from 'express-session'
import authRoutes from './routes/authRoutes.js'
import OAuthRoutes from './routes/OAuthRoutes.js'
import passport from 'passport'

dotenv.config()
const app = express()
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', OAuthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})