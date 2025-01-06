import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    logo: { type: String }, // URL for the club's logo
    colors: [{ type: String }], // Array of color codes
    slogans: [{ type: String }], // Club slogans
    league: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League', required: true
    },
    fanRoom: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FanRoom' 
    }, // Associated fan room
  }, { timestamps: true });
  
  const Club = mongoose.model('Club', clubSchema);

  export default Club