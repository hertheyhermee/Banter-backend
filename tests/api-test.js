import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:3002/api';
let authToken = '';
let testMatchId = '';

const api = axios.create({
  baseURL: API_URL,
  validateStatus: null
});

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'test123'
};

async function login() {
  try {
    const response = await api.post('/auth/login', testUser);
    authToken = response.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    console.log('✅ Login successful');
  } catch (error) {
    console.error('❌ Login failed:', error.message);
  }
}

async function testLiveMatches() {
  try {
    const response = await api.get('/matches/live');
    console.log('✅ Get live matches:', response.status === 200);
    if (response.data.matches && response.data.matches.length > 0) {
      testMatchId = response.data.matches[0].id;
      console.log('Found test match ID:', testMatchId);
    }
  } catch (error) {
    console.error('❌ Get live matches failed:', error.message);
  }
}

async function testMatchDetails() {
  if (!testMatchId) {
    console.log('⚠️ Skipping match details test - no match ID available');
    return;
  }

  try {
    const response = await api.get(`/matches/${testMatchId}`);
    console.log('✅ Get match details:', response.status === 200);
  } catch (error) {
    console.error('❌ Get match details failed:', error.message);
  }
}

async function testDefaultMemes() {
  try {
    // Test getting all memes
    const allMemes = await api.get('/matches/memes/available');
    console.log('✅ Get all memes:', allMemes.status === 200);

    // Test getting memes by category
    const categories = ['celebration', 'reaction', 'funny', 'sad', 'angry'];
    for (const category of categories) {
      const response = await api.get(`/matches/memes/available?category=${category}`);
      console.log(`✅ Get ${category} memes:`, response.status === 200);
    }
  } catch (error) {
    console.error('❌ Get memes failed:', error.message);
  }
}

async function testComments() {
  if (!testMatchId) {
    console.log('⚠️ Skipping comments test - no match ID available');
    return;
  }

  try {
    // Test getting comments
    const getComments = await api.get(`/matches/${testMatchId}/comments`);
    console.log('✅ Get comments:', getComments.status === 200);

    // Test adding a text comment
    const textComment = await api.post(`/matches/${testMatchId}/comments`, {
      content: 'Test comment'
    });
    console.log('✅ Add text comment:', textComment.status === 201);

    // Test replying to a comment
    if (textComment.status === 201) {
      const reply = await api.post(`/matches/${testMatchId}/comments`, {
        content: 'Test reply',
        parentComment: textComment.data._id
      });
      console.log('✅ Add reply:', reply.status === 201);
    }

    // Test adding a meme comment using default meme
    const memes = await api.get('/matches/memes/available');
    if (memes.data.length > 0) {
      const memeComment = await api.post(`/matches/${testMatchId}/memes`, {
        defaultMemeId: memes.data[0]._id,
        content: 'Test meme comment'
      });
      console.log('✅ Add meme comment (default):', memeComment.status === 201);
    }

    // Test uploading a custom meme
    const formData = new FormData();
    formData.append('content', 'Test custom meme');
    formData.append('meme', fs.createReadStream(path.join(__dirname, 'test-meme.jpg')));
    
    const customMeme = await api.post(`/matches/${testMatchId}/memes`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Add custom meme:', customMeme.status === 201);

  } catch (error) {
    console.error('❌ Comments test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');

  await login();
  console.log('\n--- Testing Match APIs ---');
  await testLiveMatches();
  await testMatchDetails();
  
  console.log('\n--- Testing Meme APIs ---');
  await testDefaultMemes();
  
  console.log('\n--- Testing Comment APIs ---');
  await testComments();
  
  console.log('\n✨ Tests completed!');
}

runTests(); 