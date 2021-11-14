const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketio = require('socket.io');
const reciever = require('./sockets/reciever');

const frontEndUrl = '' || 'http://localhost:3000';

const app = express();
app
	.use(cors())
	.use(cookieParser())
	.use('/spotify', require('./routes/spotify'))
	.use('/apple', require('./routes/apple'));

const server = http.createServer(app);
const ioCors = {
	cors: { origin: frontEndUrl, methods: ['GET', 'POST'] },
};
const io = socketio(server, ioCors);
reciever(io);

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
