import Meme from '../models/meme.js';
import User from '../models/User.js';
import Club from '../models/club.js';

// Create a new meme
export const createMeme = async (req, res) => {
    try {
        const { image, caption, clubId } = req.body;
        
        if (!image) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const meme = new Meme({
            creator: req.user.id,
            image,
            caption,
            club: clubId,
            likes: [],
            shares: 0
        });

        await meme.save();

        // Update user's meme count
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.memesCreated': 1 }
        });

        res.status(201).json(meme);
    } catch (error) {
        res.status(500).json({ message: 'Error creating meme', error: error.message });
    }
};

// Get a specific meme
export const getMeme = async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.memeId)
            .populate('creator', 'username profilePic')
            .populate('club', 'name logo');

        if (!meme) {
            return res.status(404).json({ message: 'Meme not found' });
        }

        res.status(200).json(meme);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meme', error: error.message });
    }
};

// Like a meme
export const likeMeme = async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.memeId);
        
        if (!meme) {
            return res.status(404).json({ message: 'Meme not found' });
        }

        const likeIndex = meme.likes.indexOf(req.user.id);
        
        if (likeIndex > -1) {
            // User already liked, remove like
            meme.likes.splice(likeIndex, 1);
        } else {
            // Add new like
            meme.likes.push(req.user.id);
        }

        await meme.save();
        
        res.status(200).json({ 
            message: likeIndex > -1 ? 'Meme unliked' : 'Meme liked',
            likesCount: meme.likes.length 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error liking meme', error: error.message });
    }
};

// Share a meme
export const shareMeme = async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.memeId);
        
        if (!meme) {
            return res.status(404).json({ message: 'Meme not found' });
        }

        meme.shares += 1;
        await meme.save();

        res.status(200).json({ 
            message: 'Meme shared successfully',
            sharesCount: meme.shares 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error sharing meme', error: error.message });
    }
};

// Get memes for a specific club
export const getClubMemes = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const memes = await Meme.find({ club: clubId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('creator', 'username profilePic')
            .populate('club', 'name logo');

        const count = await Meme.countDocuments({ club: clubId });

        res.status(200).json({
            memes,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching club memes', error: error.message });
    }
};

// Get memes created by a specific user
export const getUserMemes = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const memes = await Meme.find({ creator: userId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('creator', 'username profilePic')
            .populate('club', 'name logo');

        const count = await Meme.countDocuments({ creator: userId });

        res.status(200).json({
            memes,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user memes', error: error.message });
    }
};

// Get trending memes
export const getTrendingMemes = async (req, res) => {
    try {
        const { page = 1, limit = 10, timeframe = '7d' } = req.query;

        // Calculate date range based on timeframe
        const date = new Date();
        date.setDate(date.getDate() - (timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30));

        const memes = await Meme.find({ createdAt: { $gte: date } })
            .sort({ 
                likes: -1,
                shares: -1, 
                createdAt: -1 
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('creator', 'username profilePic')
            .populate('club', 'name logo');

        const count = await Meme.countDocuments({ createdAt: { $gte: date } });

        res.status(200).json({
            memes,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending memes', error: error.message });
    }
}; 