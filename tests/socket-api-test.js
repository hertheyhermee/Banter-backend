import axios from 'axios';
import { io } from 'socket.io-client';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3002;
const API_URL = `http://localhost:${PORT}/api`;
let authToken = '';
let socket = null;
let testMatchId = '';
let testCommentId = '';
let testBattleId = '';

const api = axios.create({
  baseURL: API_URL,
  validateStatus: null,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'test123',
  username: 'testuser'
};
const testUser1 = {
  email: 'test1@example.com',
  password: 'test1@example.com',
  username: 'testuser1'
};

// Socket connection setup with improved error handling
const connectSocket = (token) => {
  return new Promise((resolve, reject) => {
    try {
      socket = io(`http://localhost:${PORT}`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      let connected = false;

      socket.on('connect', () => {
        console.log('✅ Socket connected');
        connected = true;
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        if (!connected) {
          reject(error);
        }
      });

      // Listen for various events
      const events = [
        'battle:created',
        'battle:started',
        'battle:newArgument',
        'battle:newVote',
        'battle:newGift',
        'battle:viewerUpdate',
        'battle:ended'
      ];

      events.forEach(event => {
        socket.on(event, (data) => {
          console.log(`✅ Received ${event}:`, data);
        });
      });

      // Add timeout
      setTimeout(() => {
        if (!connected) {
          reject(new Error('Socket connection timeout'));
        }
      }, 10000);
    } catch (error) {
      reject(error);
    }
  });
};

// Add delay utility function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Add registration test
async function register() {
  try {
    console.log('Attempting registration...');
    const response = await api.post('/auth/register', {
      email: testUser1.email,
      username: testUser1.username,
      password: testUser1.password,
      confirmPassword: testUser1.password
    });
    
    console.log('Registration response:', response.status, response.data);
    
    if (response.status === 201) {
      console.log('✅ Registration successful');
      return true;
    } else if (response.status === 409) {
      console.log('⚠️ Test user already exists');
      return true;
    } else {
      console.error('❌ Registration failed:', response.data);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ Test user already exists');
      return true;
    } else {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Server is not running. Please start the server first.');
      }
      return false;
    }
  }
}

async function login() {
  try {
    console.log('Attempting login...');
    const response = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('Login response:', response.status, response.data);
    
    if (!response.data || !response.data.token) {
      console.error('❌ Login failed: No token received');
      console.log('Response:', response.data);
      return false;
    }
    
    authToken = response.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    console.log('✅ Login successful');
    
    // Connect socket after successful login
    try {
      console.log('Connecting socket...');
      await connectSocket(authToken);
      console.log('✅ Socket setup completed');
      return true;
    } catch (socketError) {
      console.error('❌ Socket connection failed:', socketError.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Please start the server first.');
    }
    return false;
  }
}

async function testLiveMatches() {
  try {
    // Add small delay to ensure socket is ready
    await delay(1000);
    
    const response = await api.get('/matches/live');
    console.log('✅ Get live matches:', response.status === 200);
    if (response.data.matches && response.data.matches.length > 0) {
      testMatchId = response.data.matches[0].id;
      console.log('Found test match ID:', testMatchId);
      
      // Join match room via socket
      socket.emit('join:match', testMatchId);
      await delay(500); // Wait for room join
    }
  } catch (error) {
    console.error('❌ Get live matches failed:', error.message);
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

    // Test adding a parent comment
    const parentComment = await api.post(`/matches/${testMatchId}/comments`, {
      content: 'Parent comment for testing'
    });
    console.log('✅ Add parent comment:', parentComment.status === 201);
    
    if (parentComment.status === 201) {
      testCommentId = parentComment.data._id;
      
      // Test adding a reply
      const reply = await api.post(`/matches/${testMatchId}/comments`, {
        content: 'This is a reply to the parent comment',
        parentComment: testCommentId
      });
      console.log('✅ Add reply to comment:', reply.status === 201);

      // Test getting replies for a specific comment
      const getReplies = await api.get(`/matches/comments/${testCommentId}/replies`);
      console.log('✅ Get comment replies:', getReplies.status === 200);

      // Test liking a comment
      const likeComment = await api.post(`/matches/comments/${testCommentId}/like`);
      console.log('✅ Like comment:', likeComment.status === 200);
    }

    // Test meme comments
    const memes = await api.get('/matches/memes/available');
    console.log('✅ Get available memes:', memes.status === 200);

    if (memes.data.length > 0) {
      // Test adding a meme comment
      const memeComment = await api.post(`/matches/${testMatchId}/memes`, {
        defaultMemeId: memes.data[0]._id,
        content: 'Test meme comment'
      });
      console.log('✅ Add meme comment:', memeComment.status === 201);

      // Test replying with a meme
      if (testCommentId) {
        const memeReply = await api.post(`/matches/${testMatchId}/memes`, {
          defaultMemeId: memes.data[0]._id,
          content: 'Meme reply',
          parentComment: testCommentId
        });
        console.log('✅ Add meme reply:', memeReply.status === 201);
      }
    }
  } catch (error) {
    console.error('❌ Comments test failed:', error.message);
  }
}

async function testBanterBattle() {
  if (!testMatchId) {
    console.log('⚠️ Skipping banter battle test - no match ID available');
    return;
  }

  try {
    console.log('\n--- Testing Banter Battles ---');
    
    // Create a battle
    console.log('Creating battle...');
    const createBattle = await api.post(`/battles/match/${testMatchId}`, {
      opponentId: 'testOpponentId', // This should be a valid user ID
      topic: 'Test Battle: Who will win?',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000) // 1 hour from now
    });
    console.log('✅ Create battle:', createBattle.status === 201);

    if (createBattle.status === 201) {
      testBattleId = createBattle.data._id;
      
      // Join battle room via socket
      console.log('Joining battle room...');
      socket.emit('join:battle', testBattleId);
      await delay(500); // Wait for room join

      // Get battle details
      console.log('Getting battle details...');
      const battleDetails = await api.get(`/battles/${testBattleId}`);
      console.log('✅ Get battle details:', battleDetails.status === 200);

      // Add argument to battle
      console.log('Adding argument...');
      const addArgument = await api.post(`/battles/${testBattleId}/argument`, {
        content: 'Test argument for the battle'
      });
      console.log('✅ Add battle argument:', addArgument.status === 201);

      // Add argument with meme
      console.log('Adding argument with meme...');
      const formData = new FormData();
      formData.append('content', 'Test argument with meme');
      formData.append('meme', fs.createReadStream(path.join(__dirname, 'test-meme.jpg')));
      const addMemeArgument = await api.post(`/battles/${testBattleId}/argument`, formData, {
        headers: { ...formData.getHeaders() }
      });
      console.log('✅ Add meme argument:', addMemeArgument.status === 201);

      // Vote in battle
      console.log('Voting in battle...');
      const vote = await api.post(`/battles/${testBattleId}/vote`, {
        votedForId: createBattle.data.challenger
      });
      console.log('✅ Vote in battle:', vote.status === 200);

      // Send gift in battle
      console.log('Sending gift...');
      const gift = await api.post(`/battles/${testBattleId}/gift`, {
        toUserId: createBattle.data.challenger,
        giftType: 'coins',
        amount: 100
      });
      console.log('✅ Send gift:', gift.status === 200);

      // End battle
      console.log('Ending battle...');
      const endBattle = await api.post(`/battles/${testBattleId}/end`);
      console.log('✅ End battle:', endBattle.status === 200);
    }
  } catch (error) {
    console.error('❌ Battle test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

async function cleanup() {
  if (socket) {
    if (testMatchId) {
      socket.emit('leave:match', testMatchId);
    }
    if (testBattleId) {
      socket.emit('leave:battle', testBattleId);
    }
    socket.disconnect();
    console.log('✅ Socket disconnected');
  }
}

async function runTests() {
  console.log('🚀 Starting API and Socket tests...\n');

  console.log('\n--- Setting up test user ---');
  const registered = await register();
  if (!registered) {
    console.error('❌ Failed to setup test user');
    process.exit(1);
  }
  
  console.log('\n--- Testing Authentication ---');
  const loggedIn = await login();
  if (!loggedIn) {
    console.error('❌ Failed to login');
    process.exit(1);
  }

  // Continue with other tests only if login successful
  await testLiveMatches();
  await testComments();
  await testBanterBattle();
  
  console.log('\n--- Cleanup ---');
  await cleanup();
  
  console.log('\n✨ Tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});