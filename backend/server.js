const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const registerSocketHandlers = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Chat application backend is running' });
});

registerSocketHandlers(io);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

