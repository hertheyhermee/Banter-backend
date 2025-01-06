import express from 'express';
import { getLeagues } from '../controllers/leagueController.js';

const router = express.Router();

router.get('/', getLeagues);

export default router;