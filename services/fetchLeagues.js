import axios from 'axios';
import dotenv from 'dotenv'

dotenv.config();

const fetchLeagues = async () => {
  try {
    const response = await axios.get('https://api-football-v1.p.rapidapi.com/v3/leagues', {
      headers: {
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
        'Host': 'api-football-v1.p.rapidapi.com',
      },
    });
    const leagues = response.data.response; // Adjust based on API structure
    return leagues;
  } catch (error) {
    console.error('Error fetching leagues: ', error);
  }
};

export default fetchLeagues