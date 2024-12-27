import mongoose from "mongoose";

const fanRoomSchema = new mongoose.Schema({
    club: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Club', 
        required: true 
    },
    news: [{ type: String }], // News items related to the club
    polls: [{ 
        question: String, 
        options: [String], 
        votes: [Number] 
    }], // Polls for fans
    updates: [{ type: String }], // Updates or announcements
  }, { timestamps: true });
  
  const FanRoom = mongoose.model('FanRoom', fanRoomSchema);

  export default FanRoom