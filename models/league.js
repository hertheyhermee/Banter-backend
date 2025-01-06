import mongoose from 'mongoose';

const leagueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  logo: { type: String },
  season: { type: Number, required: true },
  leagueId: { type: Number, unique: true, required: true }, // Reference to API's league ID
});

const League = mongoose.model('League', leagueSchema);

export default League;