const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const registerSocketHandlers = require('./socket/socketHandler');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

registerSocketHandlers(io);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
