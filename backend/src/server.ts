// Server entry point - connects to MongoDB and starts Express server with Socket.IO
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import connectDB from './config/db';

// Fix DNS SRV resolution on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Video call signaling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('offer', (data: { to: string; offer: any }) => {
    io.to(data.to).emit('offer', { from: socket.id, offer: data.offer });
  });

  socket.on('answer', (data: { to: string; answer: any }) => {
    io.to(data.to).emit('answer', { from: socket.id, answer: data.answer });
  });

  socket.on('ice-candidate', (data: { to: string; candidate: any }) => {
    io.to(data.to).emit('ice-candidate', { from: socket.id, candidate: data.candidate });
  });

  socket.on('end-call', (roomId: string) => {
    socket.to(roomId).emit('call-ended', socket.id);
    socket.leave(roomId);
  });

  socket.on('toggle-audio', (data: { roomId: string; enabled: boolean }) => {
    socket.to(data.roomId).emit('audio-toggled', { userId: socket.id, enabled: data.enabled });
  });

  socket.on('toggle-video', (data: { roomId: string; enabled: boolean }) => {
    socket.to(data.roomId).emit('video-toggled', { userId: socket.id, enabled: data.enabled });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start HTTP server with Socket.IO
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(`Socket.IO ready for connections`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
