import express from 'express';
import {
    createMeme,
    getMeme,
    likeMeme,
    shareMeme,
    getClubMemes,
    getUserMemes,
    getTrendingMemes
} from '../controllers/memeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Meme operations
router.post('/', authMiddleware, createMeme);
router.get('/:memeId', authMiddleware, getMeme);
router.post('/:memeId/like', authMiddleware, likeMeme);
router.post('/:memeId/share', authMiddleware, shareMeme);

// Meme listings
router.get('/club/:clubId', authMiddleware, getClubMemes);
router.get('/user/:userId', authMiddleware, getUserMemes);
router.get('/trending', authMiddleware, getTrendingMemes);

export default router; 