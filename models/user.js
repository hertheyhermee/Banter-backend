import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String,
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: function() { return !this.oauth; } // Only required if not using OAuth
    },
    googleId: { 
        type: String, 
        unique: true 
    },
    favoriteClub: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Club' 
    },
    trophies: [{ type: String }], // List of trophies earned
    fanScore: { 
        type: Number, 
        default: 0 
    }, // Overall activity score
    oauth: {
        type: Boolean,
        default: false
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    profilePic: { type: String }, // URL for profile picture
    stats: {
        banterBattlesWon: { 
            type: Number, 
            default: 0 
        },
        memesCreated: { 
            type: Number, 
            default: 0 
        },
        pointsEarned: { 
            type: Number, 
            default: 0 
        },
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User