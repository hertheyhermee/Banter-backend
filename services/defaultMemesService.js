import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DefaultMeme from '../models/defaultMeme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultMemes = [
  {
    name: 'Celebration Dance',
    category: 'celebration',
    filename: 'celebration-dance.gif',
    tags: ['goal', 'win', 'celebrate']
  },
  {
    name: 'Shocked Face',
    category: 'reaction',
    filename: 'shocked-face.gif',
    tags: ['surprise', 'unexpected', 'reaction']
  },
  {
    name: 'Facepalm',
    category: 'funny',
    filename: 'facepalm.gif',
    tags: ['mistake', 'fail', 'embarrassing']
  },
  {
    name: 'Sad Fan',
    category: 'sad',
    filename: 'sad-fan.gif',
    tags: ['loss', 'defeat', 'disappointment']
  },
  {
    name: 'Angry Manager',
    category: 'angry',
    filename: 'angry-manager.gif',
    tags: ['referee', 'decision', 'unfair']
  }
];

export const initializeDefaultMemes = async () => {
  try {
    const defaultMemesDir = path.join(__dirname, '..', 'public', 'default-memes');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(defaultMemesDir)) {
      fs.mkdirSync(defaultMemesDir, { recursive: true });
    }

    // Initialize each default meme
    for (const meme of defaultMemes) {
      const memePath = `/default-memes/${meme.filename}`;
      
      // Check if meme already exists in database
      const existingMeme = await DefaultMeme.findOne({ name: meme.name });
      if (!existingMeme) {
        await DefaultMeme.create({
          name: meme.name,
          category: meme.category,
          path: memePath,
          tags: meme.tags
        });
      }
    }

    console.log('Default memes initialized successfully');
  } catch (error) {
    console.error('Error initializing default memes:', error);
  }
};

export const getDefaultMemes = async (category = null) => {
  try {
    const query = category ? { category } : {};
    return await DefaultMeme.find(query).sort('-usageCount');
  } catch (error) {
    throw new Error(`Error fetching default memes: ${error.message}`);
  }
};

export const incrementMemeUsage = async (memeId) => {
  try {
    return await DefaultMeme.findByIdAndUpdate(
      memeId,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Error incrementing meme usage: ${error.message}`);
  }
}; 