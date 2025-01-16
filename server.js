import express from 'express'
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import session from 'express-session'
import authRoutes from './routes/authRoutes.js'
import OAuthRoutes from './routes/OAuthRoutes.js'
import leagueRoutes from './routes/leagueRoutes.js'
import clubRoutes from './routes/clubRoutes.js'
import userRoutes from './routes/userRoutes.js'
import battleRoutes from './routes/banterBattleRoutes.js'
import passport from 'passport'
import bodyParser from 'body-parser'
import cors from 'cors'
import memeRoutes from './routes/memeRoutes.js'
import matchRoutes from './routes/matchRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { initializeSocket } from './socket.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const httpServer = createServer(app)

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'your-secret-key', 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))
app.use('/default-memes', express.static(path.join(__dirname, 'public/default-memes')))

// Connect to database
await connectDB();

// View Routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/', (req, res) => {
    res.render('index');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/auth', OAuthRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/battles', battleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3002;

// Initialize socket with authentication
initializeSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
    console.log(`✨ Server running on http://localhost:${PORT}`);
});
