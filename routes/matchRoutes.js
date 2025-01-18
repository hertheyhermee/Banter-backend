import express from 'express';
import { 
  getAllLiveMatches, 
  getMatch, 
  getMatchComments,
  getCommentReplies, 
  addComment, 
  addMemeComment,
  getAvailableMemes,
  toggleCommentLike,
  upload 
} from '../controllers/matchController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/live', getAllLiveMatches);
router.get('/:id', getMatch);
router.get('/:id/comments', getMatchComments);
router.get('/comments/:commentId/replies', getCommentReplies);
router.get('/memes/available', getAvailableMemes);

// Protected routes - require authentication
router.post('/:id/comments', authMiddleware, addComment);
router.post('/:id/memes', authMiddleware, upload.single('meme'), addMemeComment);
router.post('/comments/:commentId/like', authMiddleware, toggleCommentLike);

export default router;