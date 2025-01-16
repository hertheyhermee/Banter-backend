import mongoose from 'mongoose';

const defaultMemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['celebration', 'reaction', 'funny', 'sad', 'angry'],
    required: true
  },
  path: {
    type: String,
    required: true,
    unique: true
  },
  tags: [{
    type: String
  }],
  usageCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('DefaultMeme', defaultMemeSchema); 