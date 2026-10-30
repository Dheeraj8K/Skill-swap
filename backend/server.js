const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const reviewRoutes = require('./routes/reviews');
const messageRoutes = require('./routes/messages');
const setupSocketIO = require('./socket');
const store = require('./db');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

setupSocketIO(io);

/* =====================
   CORS & MIDDLEWARE
===================== */
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* =====================
   API ROUTES
===================== */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);

/* =====================
   HEALTH CHECK
===================== */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    usersCount: store.getUsers().length,
    requestsCount: store.getRequests().length
  });
});

app.get('/', (req, res) => {
  res.send('⚡ LearnLoop Platform Backend API is running smoothly.');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* =====================
   START SERVER
===================== */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 LearnLoop Backend API & WebSockets running at http://localhost:${PORT}`);
});
