import express from 'express'
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import session from 'express-session'
import authRoutes from './routes/authRoutes.js'
import OAuthRoutes from './routes/OAuthRoutes.js'
import leagueRoutes from './routes/leagueRoutes.js'
import clubRoutes from './routes/clubRoutes.js'
import passport from 'passport'
import bodyParser from 'body-parser'

dotenv.config()
const app = express()
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', OAuthRoutes);
app.use('/api/leagues', leagueRoutes)
app.use('/api/clubs', clubRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})