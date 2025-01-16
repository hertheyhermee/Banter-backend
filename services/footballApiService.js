import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FOOTBALL_API_KEY = process.env.X_AUTH_TOKEN;
const BASE_URL = 'https://api.football-data.org/v4';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Auth-Token': FOOTBALL_API_KEY
  }
});

export const getLiveMatches = async () => {
  try {
    const response = await apiClient.get('/matches');
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching live matches: ${error.message}`);
  }
};

export const getMatchById = async (matchId) => {
  try {
    const response = await apiClient.get(`/matches/${matchId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching match details: ${error.message}`);
  }
};

// Function to sync match data with our database
export const syncMatchData = async (matchData) => {
  try {
    const Match = (await import('../models/match.js')).default;
    
    const match = await Match.findOneAndUpdate(
      { matchId: matchData.id },
      {
        matchId: matchData.id,
        homeTeam: matchData.homeTeam.name,
        awayTeam: matchData.awayTeam.name,
        score: {
          home: matchData.score.fullTime.home,
          away: matchData.score.fullTime.away
        },
        status: matchData.status,
        utcDate: matchData.utcDate,
        competition: {
          name: matchData.competition.name,
          id: matchData.competition.id
        },
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    return match;
  } catch (error) {
    throw new Error(`Error syncing match data: ${error.message}`);
  }
}; 