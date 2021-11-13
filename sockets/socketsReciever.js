const socketHandler = require('./socketsHandler');

// Recives ALL interactions from the front end and calls disignated handler
function socketsReciever(io) {
	io.sockets.on('connection', function (socket) {
		console.log('----- connection -----');

		// Handle when user creates or joins lobby
		socket.on('joinLobby', async (data) => {
			await socketHandler.handleJoinLobby(io, socket, data);
		});

		// TODO: make sure used players gets updated on leave
		socket.on('disconnect', () => {
			socketHandler.handleDisconnect(io, socket);
		});

		// Handle when a user sends a message in their lobby
		socket.on('lobbyMessage', (data) => {
			socketHandler.handleLobbyMessage(io, socket, data);
		});

		// Handle when a user sends a Spotify or apple search request
		socket.on('uniSearch', async (data) => {
			await socketHandler.handleUniSearch(io, socket, data);
		});

		// Handle when a user attempts to add a song to the queue
		socket.on('addSongToQueue', async (data) => {
			await socketHandler.handleAddSongToQueue(io, socket, data);
		});

		// Handle wehn a user attempts to add an album to queue
		socket.on('addAlbumToQueue', async (data) => {
			await socketHandler.handleAddAlbumToQueue(io, socket, data);
		});

		// Handle when a user hits play
		socket.on('playSong', (data) => {
			socketHandler.handlePlaySong(io, socket, data);
		});
	});
}

module.exports = socketsReciever;
