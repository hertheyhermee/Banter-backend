import express from 'express';
import { 
  createBattle,
  acceptBattle,
  addArgument,
  voteBattle,
  sendGift,
  getMatchBattles,
  getBattleDetails,
  endBattle
} from '../controllers/banterBattleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../controllers/matchController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Match-related battle routes
router.get('/match/:matchId', getMatchBattles);
router.post('/match/:matchId', createBattle);

// Battle-specific routes
router.get('/:battleId', getBattleDetails);
router.post('/:battleId/accept', acceptBattle);
router.post('/:battleId/argument', upload.single('meme'), addArgument);
router.post('/:battleId/vote', voteBattle);
router.post('/:battleId/gift', sendGift);
router.post('/:battleId/end', endBattle);

export default router; 