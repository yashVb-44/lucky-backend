const http = require('http');
const app = require('./app'); // Import the app
const connectDB = require('./config/db');
const { Server } = require('socket.io');
require('./config/env');

connectDB();

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now, adjust this in production
        methods: ["GET", "POST", "PUT", "PATCH"],
    }
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a session room
    socket.on('joinSession', (sessionId) => {
        socket.join(sessionId);
        console.log(`User ${socket.id} joined session room: ${sessionId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err.message);
    })
});

// Make io accessible in other files
app.set('io', io);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
