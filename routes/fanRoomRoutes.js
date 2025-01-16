import express from 'express';
import { 
    getFanRoom,
    createPoll,
    votePoll,
    addNews,
    addUpdate,
    getPolls,
    getNews,
    getUpdates
} from '../controllers/fanRoomController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

// Get fan room details
router.get('/:clubId', authMiddleware, getFanRoom);

// Polls
router.post('/:roomId/polls', authMiddleware, authorizeRoles('admin', 'moderator'), createPoll);
router.post('/:roomId/polls/:pollId/vote', authMiddleware, votePoll);
router.get('/:roomId/polls', authMiddleware, getPolls);

// News and Updates
router.post('/:roomId/news', authMiddleware, authorizeRoles('admin', 'moderator'), addNews);
router.post('/:roomId/updates', authMiddleware, authorizeRoles('admin', 'moderator'), addUpdate);
router.get('/:roomId/news', authMiddleware, getNews);
router.get('/:roomId/updates', authMiddleware, getUpdates);

export default router; 