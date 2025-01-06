import fetchLeagues from './fetchLeagues.js';
import fetchClubs from './fetchClubs.js';
import League from '../models/league.js';
import Club from '../models/club.js'

const storeLeagues = async () => {
  const leagues = await fetchLeagues();
  for (const league of leagues) {
    const { id, name, country, logo, season } = league.league;
    await League.updateOne(
      { leagueId: id },
      { name, country, logo, season, leagueId: id },
      { upsert: true }
    );
  }
};

const storeClubs = async (leagueId, season) => {
  const clubs = await fetchClubs(leagueId, season);
  const league = await League.findOne({ leagueId });

  for (const club of clubs) {
    const { id, name, logo } = club.team;
    if (league) {
      await Club.updateOne(
        { clubId: id },
        { name, logo, league: league._id, clubId: id },
        { upsert: true }
      );
    }
  }
};

export { storeLeagues, storeClubs };