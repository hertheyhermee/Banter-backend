import BanterBattle from '../models/banterBattle.js';
import Match from '../models/match.js';
import { getIO } from '../socket.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for meme uploads in battles
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/battle-memes';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Create a new banter battle
export const createBattle = async (req, res) => {
  try {
    const { matchId, opponentId, topic, startTime, endTime } = req.body;
    const io = getIO();

    // Verify match exists
    const match = await Match.findOne({ matchId });
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Verify opponent exists and is not the challenger
    if (opponentId === req.user.id) {
      return res.status(400).json({ message: 'Cannot challenge yourself' });
    }

    // Create battle
    const battle = new BanterBattle({
      matchId,
      challenger: req.user.id,
      opponent: opponentId,
      topic,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'pending'
    });

    const savedBattle = await battle.save();
    await savedBattle.populate([
      { path: 'challenger', select: 'username' },
      { path: 'opponent', select: 'username' }
    ]);

    // Emit socket event for real-time updates
    io.to(`match_${matchId}`).emit('battle:created', savedBattle);

    res.status(201).json(savedBattle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Accept a battle challenge
export const acceptBattle = async (req, res) => {
  try {
    const battle = await BanterBattle.findById(req.params.battleId);
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    if (battle.opponent.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the challenged opponent can accept' });
    }

    if (battle.status !== 'pending') {
      return res.status(400).json({ message: 'Battle can only be accepted when pending' });
    }

    battle.status = 'active';
    await battle.save();

    io.to(`battle_${battle._id}`).emit('battle:started', battle);

    res.status(200).json(battle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add an argument to the battle
export const addArgument = async (req, res) => {
  try {
    const { content } = req.body;
    const memePath = req.file ? `/uploads/battle-memes/${req.file.filename}` : null;

    const battle = await BanterBattle.findById(req.params.battleId);
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    if (battle.status !== 'active') {
      return res.status(400).json({ message: 'Can only add arguments to active battles' });
    }

    await battle.addArgument(req.user.id, content, memePath);
    await battle.populate('arguments.user', 'username');
    
    io.to(`battle_${battle._id}`).emit('battle:newArgument', {
      battleId: battle._id,
      argument: battle.arguments[battle.arguments.length - 1]
    });

    res.status(201).json(battle.arguments[battle.arguments.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Vote for a participant
export const voteBattle = async (req, res) => {
  try {
    const { votedForId } = req.body;
    const battle = await BanterBattle.findById(req.params.battleId);
    
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    if (battle.status !== 'active') {
      return res.status(400).json({ message: 'Can only vote on active battles' });
    }

    // Check if voted user is a participant
    if (![battle.challenger.toString(), battle.opponent.toString()].includes(votedForId)) {
      return res.status(400).json({ message: 'Can only vote for battle participants' });
    }

    await battle.addVote(req.user.id, votedForId);

    const voteCount = {
      challenger: battle.votes.filter(v => v.votedFor.toString() === battle.challenger.toString()).length,
      opponent: battle.votes.filter(v => v.votedFor.toString() === battle.opponent.toString()).length
    };

    io.to(`battle_${battle._id}`).emit('battle:newVote', {
      battleId: battle._id,
      votesCount: voteCount
    });

    res.status(200).json({ message: 'Vote recorded', voteCount });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Send a gift in a battle
export const sendGift = async (req, res) => {
  try {
    const { toUserId, giftType, amount } = req.body;
    const battle = await BanterBattle.findById(req.params.battleId);
    
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    if (battle.status !== 'active') {
      return res.status(400).json({ message: 'Can only send gifts in active battles' });
    }

    // Check if gift recipient is a participant
    if (![battle.challenger.toString(), battle.opponent.toString()].includes(toUserId)) {
      return res.status(400).json({ message: 'Can only send gifts to battle participants' });
    }

    await battle.addGift(req.user.id, toUserId, giftType, amount);
    await battle.populate('gifts.from gifts.to', 'username');

    io.to(`battle_${battle._id}`).emit('battle:newGift', {
      battleId: battle._id,
      gift: battle.gifts[battle.gifts.length - 1]
    });

    res.status(200).json({ 
      message: 'Gift sent successfully',
      gift: battle.gifts[battle.gifts.length - 1]
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get active battles for a match
export const getMatchBattles = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status } = req.query;

    const query = { 
      matchId,
      status: status ? status : { $in: ['active', 'pending'] }
    };

    const battles = await BanterBattle.find(query)
      .populate('challenger', 'username')
      .populate('opponent', 'username')
      .populate('winner', 'username')
      .sort('-createdAt');

    res.status(200).json(battles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific battle's details
export const getBattleDetails = async (req, res) => {
  try {
    const battle = await BanterBattle.findById(req.params.battleId)
      .populate('challenger', 'username')
      .populate('opponent', 'username')
      .populate('arguments.user', 'username')
      .populate('votes.user', 'username')
      .populate('gifts.from gifts.to', 'username')
      .populate('winner', 'username');

    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    // Add viewer if not already viewing
    if (!battle.viewers.includes(req.user.id)) {
      battle.viewers.push(req.user.id);
      battle.viewerCount++;
      await battle.save();

      io.to(`battle_${battle._id}`).emit('battle:viewerUpdate', {
        battleId: battle._id,
        viewerCount: battle.viewerCount
      });
    }

    res.status(200).json(battle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// End a battle
export const endBattle = async (req, res) => {
  try {
    const battle = await BanterBattle.findById(req.params.battleId);
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    if (![battle.challenger.toString(), battle.opponent.toString()].includes(req.user.id)) {
      return res.status(403).json({ message: 'Only battle participants can end the battle' });
    }

    if (battle.status !== 'active') {
      return res.status(400).json({ message: 'Can only end active battles' });
    }

    await battle.endBattle();
    await battle.populate(['winner', 'challenger', 'opponent'], 'username');

    io.to(`battle_${battle._id}`).emit('battle:ended', {
      battleId: battle._id,
      winner: battle.winner,
      reward: battle.reward
    });

    res.status(200).json(battle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 