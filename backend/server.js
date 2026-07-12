require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const registerSocketHandlers = require('./socket/socketHandler');
const { ensureSchema } = require('./storage/db');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Start only after the database schema is ready. This guarantees the store is
// available before any request/socket message is handled (no startup race).
const start = async () => {
  try {
    await ensureSchema();
    console.log('Database schema ready.');

    registerSocketHandlers(io);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server (database initialization error):', error.message);
    process.exit(1);
  }
};

start();
