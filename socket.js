import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

let io = null;

export const initializeSocket = (httpServer) => {
    // Create socket.io instance
    io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3002'],
            methods: ['GET', 'POST'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    });

    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication token missing'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.user.id);

        // Join match room
        socket.on('join:match', (matchId) => {
            socket.join(`match_${matchId}`);
            console.log(`User ${socket.user.id} joined match ${matchId}`);
            // Notify others in the room
            socket.to(`match_${matchId}`).emit('user:joined', {
                userId: socket.user.id,
                matchId
            });
        });

        // Leave match room
        socket.on('leave:match', (matchId) => {
            socket.leave(`match_${matchId}`);
            console.log(`User ${socket.user.id} left match ${matchId}`);
            // Notify others in the room
            socket.to(`match_${matchId}`).emit('user:left', {
                userId: socket.user.id,
                matchId
            });
        });

        // Join battle room
        socket.on('join:battle', (battleId) => {
            socket.join(`battle_${battleId}`);
            console.log(`User ${socket.user.id} joined battle ${battleId}`);
            // Notify others in the room
            socket.to(`battle_${battleId}`).emit('user:joined', {
                userId: socket.user.id,
                battleId
            });
        });

        // Leave battle room
        socket.on('leave:battle', (battleId) => {
            socket.leave(`battle_${battleId}`);
            console.log(`User ${socket.user.id} left battle ${battleId}`);
            // Notify others in the room
            socket.to(`battle_${battleId}`).emit('user:left', {
                userId: socket.user.id,
                battleId
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.user.id);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};

// Export the io instance getter
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}; 