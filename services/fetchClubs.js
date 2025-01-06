import axios from "axios";
import dotenv from 'dotenv'

dotenv.config();

const fetchClubs = async (leagueId, season) => {
    try {
      const response = await axios.get(`https://api-football-v1.p.rapidapi.com/v3/teams?league=${leagueId}&season=${season}`, {
        headers: {
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
          'Host': 'api-football-v1.p.rapidapi.com',
        },
      });
      const clubs = response.data.response; // Adjust based on API structure
      return clubs;
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };
  
  export default fetchClubs