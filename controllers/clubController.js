import League from '../models/league.js';
import Club from '../models/club.js';
import { storeClubs } from '../services/populateData.js';

// Get clubs by league
export const getClubsByLeague = async (req, res) => {
  const { leagueId } = req.params;
  
  try {
    const league = await League.findOne({ leagueId });
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const clubs = await Club.find({ league: league._id });
    if (clubs.length === 0) {
      await storeClubs(leagueId, league.season); // Populate clubs if none exist
      const refreshedClubs = await Club.find({ league: league._id });
      return res.status(200).json(refreshedClubs);
    }

    res.status(200).json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Failed to fetch clubs', error });
  }
};
