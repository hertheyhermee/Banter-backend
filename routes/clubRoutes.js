import express from 'express';
import { getClubsByLeague } from '../controllers/clubController.js';

const router = express.Router();

router.get('/:leagueId', getClubsByLeague);

export default router;