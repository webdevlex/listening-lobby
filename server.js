const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketio = require('socket.io');
const reciever = require('./sockets/reciever');
const path = require('path');
const frontEndUrl = '' || 'http://localhost:3000';

const app = express();

app
	.use(cors(corsOptions))
	.use(cookieParser())
	.use('/spotify', require('./routes/spotify'))
	.use('/apple', require('./routes/apple'));

const server = http.createServer(app);
const ioCors = {
	cors: { origin: frontEndUrl, methods: ['GET', 'POST'] },
};
const io = socketio(server, ioCors);
reciever(io);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
	app.use(express.static('front-end/build'));
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'front-end', 'build', 'index.html'));
	});
}

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
