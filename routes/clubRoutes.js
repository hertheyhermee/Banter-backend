import express from 'express';
import { getAllClubs } from '../controllers/clubController.js';

const router = express.Router();

router.get('/', getAllClubs);

export default router;