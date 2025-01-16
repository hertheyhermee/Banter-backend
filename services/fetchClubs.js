import axios from "axios";
import dotenv from 'dotenv'

dotenv.config();

const fetchClubs = async () => {
    try {
      const response = await axios.get(`https://api.football-data.org/v4/teams`, {
        headers: {
          'X-Auth-Token': process.env.X_AUTH_TOKEN
        },
        params: {
          limit: 300
        }
      });
      console.log(response.data);
      
      return response.data.teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
};
  
export default fetchClubs