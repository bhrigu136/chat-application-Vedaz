const express = require('express');
const cors = require('cors');

const messageRoutes = require('./routes/messageRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Chat application backend is running' });
});

// REST API
app.use('/api/messages', messageRoutes);

// 404 for any unmatched route
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Centralized error handler (must be registered last)
app.use(errorHandler);

module.exports = app;
