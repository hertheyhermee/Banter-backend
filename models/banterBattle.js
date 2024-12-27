import mongoose from "mongoose";

const banterBattleSchema = new mongoose.Schema({
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }],
    content: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        message: { type: String },
        image: { type: String }, // URL for meme or GIF
    }],
    winner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }, // Determined by community votes
    votes: [{ 
        user: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }], // Tracks votes
  }, { timestamps: true });
  
const BanterBattle = mongoose.model('BanterBattle', banterBattleSchema);
  
export default BanterBattle