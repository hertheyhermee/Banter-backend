import Club from '../models/club.js';
import fetchClubs from '../services/fetchClubs.js';

// Get all clubs
export const getAllClubs = async (req, res) => {
  try {
    const teams = await fetchClubs();
    
    // Upsert clubs
    const updatedClubs = await Promise.all(teams.map(team => 
      Club.findOneAndUpdate(
        { id: team.id },
        {
          id: team.id,
          name: team.name,
          tla: team.tla,
          shortName: team.shortName,
          crest: team.crest,
          area: team.area
        },
        { upsert: true, new: true }
      )
    ));

    res.status(200).json(updatedClubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Failed to fetch clubs', error: error.message });
  }
};
