const handlers = require('./handlers');

// Recives interactions from the front end and calls disignated handler
function socketsReciever(io) {
	io.sockets.on('connection', function (socket) {
		console.log('----- connection -----');

		// ========
		// = Join =
		// ========
		socket.on('attemptJoinLobby', async (data) => {
			await handlers.attemptJoinLobby(io, socket, data);
		});

		// ==============
		// = Disconnect =
		// ==============
		socket.on('disconnect', async () => {
			await handlers.disconnect(io, socket);
		});

		// ===========
		// = Message =
		// ===========
		socket.on('lobbyMessage', (data) => {
			handlers.lobbyMessage(io, socket, data);
		});

		// ==========
		// = Search =
		// ==========
		socket.on('uniSearch', async (data) => {
			await handlers.search(io, socket, data);
		});

		// ============
		// = Add Song =
		// ============
		socket.on('addSong', async (data) => {
			await handlers.addSong(io, socket, data);
		});

		// =============
		// = Add album =
		// =============
		socket.on('addAlbum', async (data) => {
			await handlers.addAlbum(io, socket, data);
		});

		// ========
		// = Play =
		// ========
		socket.on('play', (data) => {
			handlers.play(io, socket, data);
		});

		// ========
		// = Skip =
		// ========
		socket.on('skip', (data) => {
			handlers.skip(io, socket, data);
		});

		// =========================
		// = Get Admin Player Data =
		// =========================
		socket.on('playerData', (data) => {
			handlers.playerData(io, socket, data);
		});

		// ================
		// = Media Change =
		// ================
		socket.on('mediaChange', (data) => {
			handlers.mediaChange(io, socket, data);
		});

		// ================
		// = Remove Song =
		// ================
		socket.on('remove', (data) => {
			handlers.remove(io, socket, data);
		});

		// ==============
		// = User Ready =
		// ==============
		socket.on('userReady', (data) => {
			console.log(data.user.username, 'is ready');
			handlers.userReady(io, socket, data);
		});

		// ================
		// = Spotify Like =
		// ================
		socket.on('likeSong', (data) => {
			handlers.likeSong(io, socket, data);
		});

		// =========================
		// = Spotify set device id =
		// =========================
		socket.on('setDeviceId', (data) => {
			handlers.setDeviceId(io, socket, data);
		});

		// ===============
		// = Force Album =
		// ===============
		socket.on('forceAlbum', (data) => {
			handlers.forceAlbum(io, socket, data);
		});

		// =================
		// = Artist Search =
		// =================
		socket.on('artistSearch', (data) => {
			handlers.artistSearch(io, socket, data);
		});

		// ====================
		// = Get Album Tracks =
		// ====================
		socket.on('getAlbumTracks', (data) => {
			handlers.getAlbumTracks(io, socket, data);
		});

		// ==================
		// = Toggle Shuffle =
		// ==================
		socket.on('setShuffle', (data) => {
			handlers.handleShuffle(io, data);
		});

		// =======================
		// = Song Double Clicked =
		// =======================
		socket.on('songDoubleClicked', (data) => {
			handlers.doubleClickToPlay(io, socket, data);
		});
	});
}

module.exports = socketsReciever;
