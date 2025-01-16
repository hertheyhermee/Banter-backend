import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    ref: 'Match'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'meme'],
    default: 'text'
  },
  memePath: {
    type: String,
    required: function() {
      return this.type === 'meme';
    }
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  replyCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  depth: {
    type: Number,
    default: 0,
    max: 3 // Limit nesting to 3 levels
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster querying
commentSchema.index({ matchId: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ user: 1 });

// Virtual field for time ago
commentSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Pre-save middleware to set depth
commentSchema.pre('save', async function(next) {
  if (this.parentComment) {
    const parent = await this.constructor.findById(this.parentComment);
    if (parent) {
      this.depth = parent.depth + 1;
      if (this.depth > 3) {
        throw new Error('Maximum reply depth exceeded');
      }
    }
  }
  next();
});

// Method to like a comment
commentSchema.methods.toggleLike = async function(userId) {
  const userIdStr = userId.toString();
  const userLikeIndex = this.likes.findIndex(id => id.toString() === userIdStr);
  
  if (userLikeIndex === -1) {
    this.likes.push(userId);
    this.likeCount++;
  } else {
    this.likes.splice(userLikeIndex, 1);
    this.likeCount--;
  }
  
  return this.save();
};

// Method to add a reply
commentSchema.methods.addReply = async function(replyComment) {
  this.replies.push(replyComment._id);
  this.replyCount++;
  return this.save();
};

export default mongoose.model('Comment', commentSchema); 