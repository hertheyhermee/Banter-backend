import mongoose from "mongoose";

const memeSchema = new mongoose.Schema({
    creator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    image: { 
        type: String, 
        required: true 
    }, // URL for the meme image
    caption: { type: String },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }], // Users who liked the meme
    shares: { 
        type: Number, 
        default: 0 
    },
    club: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Club' 
    }, // Associated club
  }, { timestamps: true });
  
  const Meme = mongoose.model('Meme', memeSchema);

  export default Meme
  