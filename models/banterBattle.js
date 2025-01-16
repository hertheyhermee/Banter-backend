import mongoose from "mongoose";

const banterBattleSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    ref: 'Match'
  },
  challenger: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  topic: {
    type: String,
    required: true
  },
  arguments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    memePath: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  gifts: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    giftType: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reward: {
    points: {
      type: Number,
      default: 0
    },
    badges: [{
      type: String
    }]
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  viewerCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Indexes for faster querying
banterBattleSchema.index({ matchId: 1, status: 1 });
banterBattleSchema.index({ challenger: 1 });
banterBattleSchema.index({ opponent: 1 });
banterBattleSchema.index({ status: 1, startTime: -1 });

// Virtual for battle duration
banterBattleSchema.virtual('duration').get(function() {
  return this.endTime - this.startTime;
});

// Method to add an argument
banterBattleSchema.methods.addArgument = async function(userId, content, memePath = null) {
  if (![this.challenger.toString(), this.opponent.toString()].includes(userId.toString())) {
    throw new Error('Only battle participants can add arguments');
  }
  
  this.arguments.push({
    user: userId,
    content,
    memePath
  });
  
  return this.save();
};

// Method to add a vote
banterBattleSchema.methods.addVote = async function(userId, votedForId) {
  // Check if user has already voted
  const existingVote = this.votes.find(vote => vote.user.toString() === userId.toString());
  if (existingVote) {
    existingVote.votedFor = votedForId;
    existingVote.timestamp = new Date();
  } else {
    this.votes.push({
      user: userId,
      votedFor: votedForId
    });
  }
  
  return this.save();
};

// Method to add a gift
banterBattleSchema.methods.addGift = async function(fromUserId, toUserId, giftType, amount) {
  this.gifts.push({
    from: fromUserId,
    to: toUserId,
    giftType,
    amount
  });
  
  return this.save();
};

// Method to end battle and determine winner
banterBattleSchema.methods.endBattle = async function() {
  if (this.status !== 'active') {
    throw new Error('Can only end active battles');
  }

  // Count votes for each participant
  const voteCount = this.votes.reduce((acc, vote) => {
    const votedForId = vote.votedFor.toString();
    acc[votedForId] = (acc[votedForId] || 0) + 1;
    return acc;
  }, {});

  // Determine winner based on votes
  const challengerVotes = voteCount[this.challenger.toString()] || 0;
  const opponentVotes = voteCount[this.opponent.toString()] || 0;

  this.winner = challengerVotes > opponentVotes ? this.challenger : this.opponent;
  this.status = 'completed';

  // Calculate rewards based on votes and gifts
  const winnerRewardPoints = (Math.max(challengerVotes, opponentVotes) * 10) + 
    (this.gifts.reduce((sum, gift) => sum + gift.amount, 0));

  this.reward = {
    points: winnerRewardPoints,
    badges: this.determineEarnedBadges()
  };

  return this.save();
};

// Helper method to determine earned badges
banterBattleSchema.methods.determineEarnedBadges = function() {
  const badges = [];
  const voteCount = this.votes.length;
  const giftCount = this.gifts.length;
  const argumentCount = this.arguments.length;

  if (voteCount >= 100) badges.push('Popular');
  if (giftCount >= 50) badges.push('Gifted');
  if (argumentCount >= 20) badges.push('Debater');
  if (this.viewerCount >= 1000) badges.push('Viral');

  return badges;
};

export default mongoose.model('BanterBattle', banterBattleSchema);