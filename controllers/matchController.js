import { getLiveMatches, getMatchById, syncMatchData } from '../services/footballApiService.js';
import { getDefaultMemes, incrementMemeUsage } from '../services/defaultMemesService.js';
import Match from '../models/match.js';
import Comment from '../models/comment.js';
import DefaultMeme from '../models/defaultMeme.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for meme uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/memes';
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

// Get all live matches
export const getAllLiveMatches = async (req, res) => {
  try {
    const matches = await getLiveMatches();
    // Sync matches with our database
    await Promise.all(matches.matches.map(match => syncMatchData(match)));
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific match details
export const getMatch = async (req, res) => {
  try {
    const match = await getMatchById(req.params.id);
    await syncMatchData(match);
    res.status(200).json(match);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get match comments
export const getMatchComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const parentId = req.query.parentId || null;

    const query = { 
      matchId: req.params.id,
      parentComment: parentId
    };

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate('user', 'username')
        .populate({
          path: 'replies',
          options: { limit: 3 }, // Show only first 3 replies initially
          populate: {
            path: 'user',
            select: 'username'
          }
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query)
    ]);

    // Add timeAgo to each comment
    const commentsWithTimeAgo = comments.map(comment => {
      const commentDoc = new Comment(comment);
      return {
        ...comment,
        timeAgo: commentDoc.timeAgo
      };
    });

    res.status(200).json({
      comments: commentsWithTimeAgo,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComments: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comment replies
export const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [replies, total] = await Promise.all([
      Comment.find({ parentComment: commentId })
        .populate('user', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ parentComment: commentId })
    ]);

    // Add timeAgo to each reply
    const repliesWithTimeAgo = replies.map(reply => {
      const replyDoc = new Comment(reply);
      return {
        ...reply,
        timeAgo: replyDoc.timeAgo
      };
    });

    res.status(200).json({
      replies: repliesWithTimeAgo,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReplies: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available memes
export const getAvailableMemes = async (req, res) => {
  try {
    const { category } = req.query;
    const memes = await getDefaultMemes(category);
    res.status(200).json(memes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a comment
export const addComment = async (req, res) => {
  try {
    // Check if this is a reply and verify parent comment exists
    if (req.body.parentComment) {
      const parentComment = await Comment.findById(req.body.parentComment);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = new Comment({
      matchId: req.params.id,
      user: req.user.id,
      content: req.body.content,
      type: 'text',
      parentComment: req.body.parentComment || null
    });

    const savedComment = await comment.save();

    // If this is a reply, update the parent comment
    if (req.body.parentComment) {
      const parentComment = await Comment.findById(req.body.parentComment);
      await parentComment.addReply(savedComment);
    }

    await savedComment.populate('user', 'username');
    res.status(201).json({
      ...savedComment.toJSON(),
      timeAgo: savedComment.timeAgo
    });
  } catch (error) {
    if (error.message === 'Maximum reply depth exceeded') {
      return res.status(400).json({ message: 'Cannot reply to this comment. Maximum depth reached.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Add a meme comment
export const addMemeComment = async (req, res) => {
  try {
    let memePath;
    
    if (req.file) {
      // Custom uploaded meme
      memePath = `/uploads/memes/${req.file.filename}`;
    } else if (req.body.defaultMemeId) {
      // Using a default meme
      await incrementMemeUsage(req.body.defaultMemeId);
      const defaultMeme = await DefaultMeme.findById(req.body.defaultMemeId);
      if (!defaultMeme) {
        throw new Error('Default meme not found');
      }
      memePath = defaultMeme.path;
    } else {
      throw new Error('Either file upload or default meme ID is required');
    }

    // Check if this is a reply and verify parent comment exists
    if (req.body.parentComment) {
      const parentComment = await Comment.findById(req.body.parentComment);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = new Comment({
      matchId: req.params.id,
      user: req.user.id,
      content: req.body.content || 'Meme',
      type: 'meme',
      memePath,
      parentComment: req.body.parentComment || null
    });

    const savedComment = await comment.save();

    // If this is a reply, update the parent comment
    if (req.body.parentComment) {
      const parentComment = await Comment.findById(req.body.parentComment);
      await parentComment.addReply(savedComment);
    }

    await savedComment.populate('user', 'username');
    res.status(201).json({
      ...savedComment.toJSON(),
      timeAgo: savedComment.timeAgo
    });
  } catch (error) {
    if (error.message === 'Maximum reply depth exceeded') {
      return res.status(400).json({ message: 'Cannot reply to this comment. Maximum depth reached.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Toggle like on a comment
export const toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.toggleLike(req.user.id);
    res.status(200).json({
      likes: comment.likes,
      likeCount: comment.likeCount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 