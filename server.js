const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const docRoutes = require('./routes/docRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', docRoutes);

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id);

  socket.on('joinDocument', (docId) => {
    socket.join(docId);
    console.log(`User joined document ${docId}`);
  });

  socket.on('leaveDocument', (docId) => {
    socket.leave(docId);
    console.log(`User left document ${docId}`);
  });

  socket.on('documentChange', ({ docId, content }) => {
    socket.to(docId).emit('documentUpdate', content);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
