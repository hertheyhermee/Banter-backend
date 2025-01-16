import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
    id: { 
        type: Number,
        required: true,
        unique: true
    },
    name: { 
        type: String, 
        required: true
    },
    tla: { 
        type: String
    },
    shortName: {
        type: String
    },
    crest: { 
        type: String
    },
    area: {
        id: Number,
        name: String,
        code: String,
        flag: String
    },
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    }]
}, { timestamps: true });
  
const Club = mongoose.model('Club', clubSchema);

export default Club