const lobby = require('./lobby');
const helpers = require('./helpers');

const LOBBY_MAX_CAPACITY = 8;

// ========
// = Join =
// ========
async function joinLobby(io, socket, data) {
	const { lobby_id } = data;
	data.user_id = socket.id;
	socket.join(lobby_id);

	// Check if lobby exists and handle accordingly
	if (!lobby.lobbyExists(lobby_id)) {
		// Get token for music provider that admin is NOT using
		const tempToken = await helpers.generateTempToken(data.music_provider);

		// Create and join lobby
		lobby.generateLobby(data, tempToken);
		const members = lobby.getMembers(lobby_id);
		const messages = [];
		const adminData = lobby.getAdminData(data);

		// Send new lobby data back to members
		io.to(lobby_id).emit('setLobbyInfo', members, messages);
		io.to(lobby_id).emit('doneLoading', {});
		io.to(lobby_id).emit('setAdmin', adminData.user_id);
		operatorMessage(io, 'Welcome to the listening lobby!', lobby_id);
	} else {
		const lobbyRef = lobby.getLobbyById(lobby_id);
		lobby.joinLobby(data);

		// If not exceeding the limit then join existing lobby
		if (lobbyRef.users.length < LOBBY_MAX_CAPACITY) {
			io.to(lobby_id).emit('deactivateButtons');

			const members = lobby.getMembers(lobby_id);
			const messages = lobby.getLobbyMessages(lobby_id);
			// Send new lobby data back to members
			// TODO send queue and ui queue to designated player
			io.to(lobby_id).emit('setLobbyInfo', members, messages);
			io.to(socket.id).emit('addSong', lobbyRef.queue);

			if (!lobbyRef.loading) {
				lobby.setLobbyLoading(lobby_id, true);
				socket.broadcast.emit('getUserReady');
			}

			const adminData = lobby.getAdminData(data);
			io.to(lobby_id).emit('setAdmin', adminData.user_id);
			io.to(adminData.user_id).emit('getPlayerData', socket.id);
			operatorMessage(io, `${data.username} joined the lobby!`, lobby_id);
		}
		// Limit reached dont allow them to join
		else {
			io.to(socket.id).emit('lobbyMaxReached');
		}
	}
}

// ==============
// = Disconnect =
// ==============
async function disconnect(io, socket) {
	console.log('----- disconnection -----');
	// Get lobby data
	const lobbyRef = lobby.getLobbyByUserId(socket.id);

	// Notify the lobby that this user left
	const member = lobby.getUserById(lobbyRef.lobby_id, socket.id);
	operatorMessage(io, `${member.username} left the lobby.`, lobbyRef.lobby_id);

	// Remove the member who left from the lobby
	const i = lobby.leaveLobby(lobbyRef, socket.id);

	// If there is no more users left in the lobby delete the entire lobby
	if (lobbyRef.users.length === 0) {
		lobby.deleteLobbyByIndex(i);
	}
	// If there is still users in the lobby just remove the person who left and update everyones ui
	else {
		const members = lobby.getMembers(lobbyRef.lobby_id);
		const messages = lobby.getLobbyMessages(lobbyRef.lobby_id);
		io.to(lobbyRef.lobby_id).emit('setLobbyInfo', members, messages);

		// If the admin leaves set the next person in the members array as admin
		if (lobbyRef.users[0].privilege !== 'admin') {
			lobby.setFirstMemberAsAdmin(i);
			const adminData = lobby.getAdminData({ lobby_id: lobbyRef.lobby_id });
			io.to(lobbyRef.lobby_id).emit('setAdmin', adminData.user_id);
		}

		// Check if the person left while buttons were loading
		if (lobbyRef.usersReady === lobbyRef.users.length) {
			io.to(user.lobby_id).emit('activateButtons');
			lobby.resetReadyCount(user.lobby_id);
		}
	}
}

// ===========
// = Message =
// ===========
function lobbyMessage(io, socket, { user, message }) {
	// Format message for front end
	const formattedMessage = helpers.formatMessage(user.username, message);
	// Add message to lobby
	const messages = lobby.addMessageToLobby(formattedMessage, user.lobby_id);
	// Send all messages to members in lobby
	io.to(user.lobby_id).emit('lobbyMessage', messages);
}

// ==========
// = Search =
// ==========
async function search(io, socket, data) {
	// Perform search using the music provider of user that made the request
	data.user.user_id = socket.id;
	let searchResults = await helpers.uniSearch(data);
	// Format search results for front-end
	const formattedResults = helpers.formatUniSearchResults(searchResults, data);
	// Send results back to user who made the request
	io.to(socket.id).emit('uniSearchResults', formattedResults);
}

// ============
// = Add Song =
// ============
async function addSong(io, socket, data) {
	// Get lobby data
	const lobbyRef = lobby.getLobbyById(data.user.lobby_id);
	io.to(data.user.lobby_id).emit('deactivateButtons');
	lobby.setLobbyLoading(data.user.lobby_id, true);

	// Perform the necessary searches and return an object containing display for ui and data for each player

	let allSongData = await helpers.getSongDataForPlayers(lobbyRef.tokens, data);
	// Make sure the ui knows who added the song
	allSongData.dataForUi.addedBy = data.user.username;

	// Add song to lobby
	lobby.addSongToLobby(data.user.lobby_id, allSongData);

	// Send front end the data for ui, spotify player, and apple player
	io.to(data.user.lobby_id).emit('addSong', lobbyRef.queue);
	io.to(socket.id).emit('addCheck', data.songData.uniId);
	if (lobbyRef.queue.length === 1) {
		io.to(data.user.lobby_id).emit('firstSong', lobbyRef.queue);
	} else {
		lobby.setLobbyLoading(data.user.lobby_id, false);
		io.to(data.user.lobby_id).emit('activateButtons');
	}
}

// =============
// = Add album =
// =============
async function addAlbum(io, socket, data) {
	// Get lobby data
	const lobbyRef = lobby.getLobbyById(data.user.lobby_id);
	io.to(data.user.lobby_id).emit('deactivateButtons');
	lobby.setLobbyLoading(data.user.lobby_id, true);

	// Check if first time a song/album is added to the queue
	let firstSong;
	if (lobbyRef.queue.length === 0) {
		firstSong = true;
	}

	// Perform the necessary searches and return an object containing display for ui and song data for each player
	const allSongData = await helpers.uniAlbumSearch(lobbyRef.tokens, data);
	const appleFound = allSongData.dataForApplePlayer;
	const spotifyFound = allSongData.dataForSpotifyPlayer;
	const missingOn = spotifyFound ? 'apple' : 'spotify';

	// add all album songs to queue
	if (appleFound && spotifyFound) {
		lobby.addAlbumToLobby(data.user.lobby_id, allSongData);

		// Send front end the data for ui, spotify player, and apple player
		io.to(data.user.lobby_id).emit('addSong', lobbyRef.queue);
		// console.log(data);
		io.to(socket.id).emit('addCheck', data.albumData.id);

		if (firstSong) {
			io.to(data.user.lobby_id).emit('firstSong', lobbyRef.queue);
		} else {
			lobby.setLobbyLoading(data.user.lobby_id, false);
			io.to(data.user.lobby_id).emit('activateButtons');
		}
	} else {
		allSongData.albumId = data.albumData.id;
		lobby.setAlbumHold(data.user.lobby_id, allSongData);
		lobby.setLobbyLoading(data.user.lobby_id, false);
		io.to(data.user.lobby_id).emit('activateButtons');
		io.to(socket.id).emit('questionAlbumAdd', missingOn);
	}
}

// ========
// = Play =
// ========
function play(io, socket, { user }) {
	const lobbyRef = lobby.getLobbyById(user.lobby_id);
	const play = lobby.updatePlayStatus(user.lobby_id);

	if (lobbyRef.queue.length > 0) {
		io.to(user.lobby_id).emit('deactivateButtons');
		lobby.setLobbyLoading(user.lobby_id, true);

		if (play) {
			io.to(user.lobby_id).emit('play', lobbyRef.queue[0]);
		} else {
			io.to(user.lobby_id).emit('pause', lobbyRef.queue[0]);
		}
	} else {
		console.log('empty queue');
	}
}

// ========
// = Skip =
// ========
function skip(io, socket, { user }) {
	const lobbyRef = lobby.getLobbyById(user.lobby_id);
	if (lobbyRef.queue.length > 0) {
		lobby.popSong(user.lobby_id);
		io.to(user.lobby_id).emit('addSong', lobbyRef.queue);
		io.to(user.lobby_id).emit('deactivateButtons');
		operatorMessage(
			io,
			`${user.username} skipped the song.`,
			lobbyRef.lobby_id
		);

		lobby.setLobbyLoading(user.lobby_id, true);

		if (lobbyRef.queue.length === 0) {
			lobby.setPlayStatusPaused(user.lobby_id);
			io.to(user.lobby_id).emit('emptyQueue', lobbyRef.queue);
		} else {
			lobby.setPlayStatusPlaying(user.lobby_id);
			io.to(user.lobby_id).emit('popped', lobbyRef.queue);
		}
	}
}

// =========================
// = Get Admin Player Data =
// =========================
function playerData(io, socket, data) {
	const member = lobby.getMostRecentlyJoined(data);
	socket.to(member.user_id).emit('doneLoading', {
		paused: data.paused,
		timestamp: data.timestamp,
	});
}

// ================
// = Media Change =
// ================
function mediaChange(io, socket, { user }) {
	if (!lobby.inTimeout(user.lobby_id)) {
		lobby.setTimeoutTo(user.lobby_id, true);
		startInterval(user.lobby_id);

		const lobbyRef = lobby.getLobbyById(user.lobby_id);
		if (lobbyRef.queue.length > 0) {
			lobby.popSong(user.lobby_id);
			io.to(user.lobby_id).emit('addSong', lobbyRef.queue);
			io.to(user.lobby_id).emit('deactivateButtons');
			lobby.setLobbyLoading(user.lobby_id, true);

			if (lobbyRef.queue.length === 0) {
				lobby.setPlayStatusPaused(user.lobby_id);
				io.to(user.lobby_id).emit('emptyQueue', lobbyRef.queue);
			} else {
				lobby.setPlayStatusPlaying(user.lobby_id);
				io.to(user.lobby_id).emit('popped', lobbyRef.queue);
			}
		}
	}
}

function startInterval(lobby_id) {
	setTimeout(() => {
		lobby.setTimeoutTo(lobby_id, false);
		console.log('ready');
	}, 10000);
}

// ================
// = Remove Song =
// ================
function remove(io, socket, { index, user, songName }) {
	const lobby_id = user.lobby_id;
	const lobbyRef = lobby.getLobbyById(lobby_id);
	io.to(lobby_id).emit('deactivateButtons');
	lobby.setLobbyLoading(lobby_id, true);

	const isFirstSong = index === 0;
	if (isFirstSong) {
		lobby.popSong(lobby_id);

		if (lobbyRef.queue.length === 0) {
			lobby.setPlayStatusPaused(lobby_id);
			io.to(lobby_id).emit('emptyQueue', lobbyRef.queue);
		} else {
			0.33;
			io.to(lobby_id).emit('removeFirst', lobbyRef.queue, lobbyRef.playing);
		}
	} else {
		io.to(lobby_id).emit('activateButtons');
		lobby.removeSong(index, lobby_id);
	}
	io.to(lobby_id).emit('addSong', lobbyRef.queue);
	operatorMessage(io, `${user.username} removed ${songName}.`, lobby_id);
}

// ==============
// = User Ready =
// ==============
function userReady(io, socket, { user }) {
	const lobbyRef = lobby.getLobbyById(user.lobby_id);
	lobby.increaseReadyCount(user);

	if (lobbyRef.usersReady === lobbyRef.users.length) {
		io.to(user.lobby_id).emit('activateButtons');
		lobby.setLobbyLoading(user.lobby_id, false);
		lobby.resetReadyCount(user.lobby_id);
	}
}

// ================
// = Spotify Like =
// ================
function likeSong(io, socket, data) {
	helpers.likeSong(data);
}

// =========================
// = Spotify set device id =
// =========================
async function setDeviceId(io, socket, data) {
	lobby.setDeviceId(socket.id, data);
}

function forceAlbum(io, socket, { user, addedToQueue }) {
	const lobbyRef = lobby.getLobbyById(user.lobby_id);
	io.to(user.lobby_id).emit('deactivateButtons');
	lobby.setLobbyLoading(user.lobby_id, true);

	// Check if first time a song/album is added to the queue
	let firstSong;
	if (lobbyRef.queue.length === 0) {
		firstSong = true;
	}

	const albumHold = lobby.getAndRemoveHold(user.lobby_id);
	lobby.addAlbumToLobby(user.lobby_id, albumHold);
	io.to(user.lobby_id).emit('addSong', lobbyRef.queue);
	io.to(socket.id).emit('addCheck', albumHold.albumId);

	if (firstSong) {
		io.to(user.lobby_id).emit('firstSong', lobbyRef.queue);
	} else {
		lobby.setLobbyLoading(user.lobby_id, false);
		io.to(user.lobby_id).emit('activateButtons');
	}
}

function operatorMessage(io, message, lobby_id) {
	const formattedMessage = helpers.formatMessage('Listening Lobby', message);
	const messages = lobby.addMessageToLobby(formattedMessage, lobby_id);
	io.to(lobby_id).emit('lobbyMessage', messages);
}

module.exports = {
	joinLobby,
	disconnect,
	lobbyMessage,
	search,
	addSong,
	addAlbum,
	play,
	skip,
	playerData,
	mediaChange,
	remove,
	userReady,
	likeSong,
	setDeviceId,
	forceAlbum,
};
