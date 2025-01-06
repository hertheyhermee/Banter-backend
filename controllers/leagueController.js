import League from '../models/league.js';
import { storeLeagues } from '../services/populateData.js';

// Get all leagues
export const getLeagues = async (req, res) => {
  try {
    const leagues = await League.find();
    if (leagues.length === 0) {
      await storeLeagues(); // Populate leagues if none exist
      const refreshedLeagues = await League.find();
      return res.status(200).json(refreshedLeagues);
    }
    res.status(200).json(leagues);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    res.status(500).json({ message: 'Failed to fetch leagues', error });
  }
};