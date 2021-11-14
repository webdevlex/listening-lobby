const handlers = require('./handlers');

// Recives ALL interactions from the front end and calls disignated handler
function socketsReciever(io) {
	io.sockets.on('connection', function (socket) {
		console.log('----- connection -----');

		// Handle when user creates or joins lobby
		socket.on('joinLobby', async (data) => {
			await handlers.handleJoinLobby(io, socket, data);
		});

		// TODO: make sure used players gets updated on leave
		socket.on('disconnect', () => {
			handlers.handleDisconnect(io, socket);
		});

		// Handle when a user sends a message in their lobby
		socket.on('lobbyMessage', (data) => {
			handlers.handleLobbyMessage(io, socket, data);
		});

		// Handle when a user sends a Spotify or apple search request
		socket.on('uniSearch', async (data) => {
			await handlers.handleUniSearch(io, socket, data);
		});

		// Handle when a user attempts to add a song to the queue
		socket.on('addSongToQueue', async (data) => {
			await handlers.handleAddSongToQueue(io, socket, data);
		});

		// Handle wehn a user attempts to add an album to queue
		socket.on('addAlbumToQueue', async (data) => {
			await handlers.handleAddAlbumToQueue(io, socket, data);
		});

		// Handle when a user hits play
		socket.on('playSong', (data) => {
			handlers.handlePlaySong(io, socket, data);
		});

		// TODO Handle when a user hits next song

		// TODO Handle when a user likes a song
	});
}

module.exports = socketsReciever;
