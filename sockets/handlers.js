const lobby = require('./lobby');
const helpers = require('./helpers');

// ---------- Handle when someone creates or joins lobby ----------
async function handleJoinLobby(io, socket, data) {
	const { lobby_id, username, music_provider, token } = data;
	data.user_id = socket.id;
	socket.join(lobby_id);

	// Set playlist id to new spotify playlist created on users account
	if (music_provider === 'spotify') {
		// console.log(data);
	}

	// Check if lobby exists and handle accordingly
	if (!lobby.lobbyExists(lobby_id)) {
		// Get token for music provider that admin is NOT using
		const tempToken = await helpers.generateTempToken(data.music_provider);

		// Create and join lobby
		lobby.generateLobby(data, tempToken);
		const members = [username];
		const messages = [];
		// Send new lobby data back to members
		io.to(lobby_id).emit('setLobbyInfo', members, messages);
		io.to(lobby_id).emit('doneLoading', {});
	}
	// Join existing lobby
	else {
		lobby.joinLobby(data);
		const lobbyRef = lobby.getLobbyById(data.lobby_id);

		const members = lobby.getMemberUsernames(lobby_id);
		const messages = lobby.getLobbyMessages(lobby_id);
		// Send new lobby data back to members
		// TODO send queue and ui queue to designated player
		io.to(lobby_id).emit('setLobbyInfo', members, messages);
		io.to(socket.id).emit('addSong', lobbyRef.queue);

		const adminData = lobby.getAdminData(data);
		io.to(adminData.user_id).emit('getPlayerData', socket.id);
	}
}
// ---------- Handle when spotify users player is ready ----------
async function handleSetDeviceId(io, socket, data) {
	lobby.setDeviceId(socket.id, data);
}

// ---------- Handle when someone leaves the lobby ----------
async function handleDisconnect(io, socket) {
	console.log('----- disconnection -----');
	// Get lobby data
	const lobbyRef = lobby.getLobbyByUserId(socket.id);

	// Remove the member who left from the lobby
	const i = lobby.leaveLobby(lobbyRef, socket.id);

	// If there is no more users left in the lobby delete the entire lobby
	if (lobbyRef.users.length === 0) {
		lobby.deleteLobbyByIndex(i);
	}
	// If there is still users in the lobby just remove the person who left and update everyones ui
	else {
		const members = lobby.getMemberUsernames(lobbyRef.lobby_id);
		const messages = lobby.getLobbyMessages(lobbyRef.lobby_id);
		io.to(lobbyRef.lobby_id).emit('setLobbyInfo', members, messages);
	}
}

// ---------- Handle when someone sends a lobby message ----------
function handleLobbyMessage(io, socket, { user, message }) {
	// Format message for front end
	const formattedMessage = helpers.formatMessage(user.username, message);
	// Add message to lobby
	const messages = lobby.addMessageToLobby(formattedMessage, user.lobby_id);
	// Send all messages to members in lobby
	io.to(user.lobby_id).emit('lobbyMessage', messages);
}

// ---------- Handle Spotify and apple search request ----------
async function handleUniSearch(io, socket, data) {
	// Perform search on users music provider
	let searchResults = await helpers.uniSearch(data);
	// Format search results for front-end
	const formattedResults = helpers.formatUniSearchResults(searchResults, data);
	// Send results back to user who performed search
	io.to(socket.id).emit('uniSearchResults', formattedResults);
}

// ---------- Handle adding album to queue ----------
async function handleAddAlbumToQueue(io, socket, data) {
	// Get lobby data
	const lobbyRef = lobby.getLobbyById(data.user.lobby_id);
	// Perform the necessary searches and return an object containing display for ui and song data for each player
	const albumData = await helpers.uniAlbumSearch(lobbyRef.players, data);
	// Send ui and players the data
	sendAlbumToUi(io, albumData, lobbyRef);
	sendAlbumToPlayers(io, lobbyRef, albumData);
}

// Display each song in album on members ui
function sendAlbumToUi(io, albumData, { lobby_id, queue }) {
	albumData.dataForUi.forEach((track) => lobby.addSongToLobby(lobby_id, track));
	io.to(lobby_id).emit('addSong', queue);
}

// Add songs in album to members players
function sendAlbumToPlayers(
	io,
	lobbyRef,
	{ dataForSpotifyPlayer, dataForApplePlayer }
) {
	// For all members in lobby add songs in album to their playlist
	lobbyRef.users.forEach((user) => {
		if (user.music_provider === 'spotify') {
			// Alexis TODO
			// spotify.addAlbumToPlaylist(dataForSpotifyPlayer, user);
		} else {
			io.to(user.user_id).emit('updateAppleQueue', dataForApplePlayer);
		}
	});
}

// ---------- Handle when someone clicks play ----------
function handlePlay(io, socket, { lobby_id }) {
	const lobbyRef = lobby.getLobbyById(lobby_id);
	const play = lobby.updatePlayStatus(lobby_id);

	if (lobbyRef.queue.length > 0) {
		if (play) {
			io.to(lobby_id).emit('play');
		} else {
			io.to(lobby_id).emit('pause');
		}
	} else {
		console.log('empty queue');
	}
}

// ---------- Handle when someone clicks play next ----------
function handleSkip(io, socket, data) {
	handleMediaChange(io, socket, data);
}

// ---------- Handle when someone clicks play next ----------
function handlePlayerData(io, socket, data) {
	const member = lobby.getMostRecentlyJoined(data);
	socket.to(member.user_id).emit('doneLoading', {
		paused: data.paused,
		timestamp: data.timestamp,
	});
}

// TODAY
// ---------- Handle adding song to queue ----------
async function handleAddSong(io, socket, data) {
	// Get lobby data
	const lobbyRef = lobby.getLobbyById(data.user.lobby_id);

	// Perform the necessary searches and return an object containing display for ui and data for each player
	const allSongData = await helpers.getSongDataForPlayers(
		lobbyRef.tokens,
		data
	);

	// Add song to lobby
	lobby.addSongToLobby(data.user.lobby_id, allSongData);

	// Send front end the data for ui, spotify player, and apple player
	io.to(data.user.lobby_id).emit('addSong', lobbyRef.queue);
	if (lobbyRef.queue.length === 1) {
		io.to(data.user.lobby_id).emit('firstSong', lobbyRef.queue);
	}
}

// ---------- Handle when current song ends ----------
function handleMediaChange(io, socket, { lobby_id }) {
	const lobbyRef = lobby.getLobbyById(lobby_id);
	if (lobbyRef.queue.length > 0) {
		lobby.popSong(lobby_id);
		io.to(lobby_id).emit('addSong', lobbyRef.queue);

		if (lobbyRef.queue.length === 0) {
			lobby.setPlayStatusPaused(lobby_id);
			io.to(lobby_id).emit('emptyQueue', lobbyRef.queue);
		} else {
			lobby.setPlayStatusPlaying(lobby_id);
			io.to(lobby_id).emit('popped', lobbyRef.queue);
		}
	}
}

function handleRemove(io, socket, { index, lobby_id }) {
	const lobbyRef = lobby.getLobbyById(lobby_id);

	if (index === 0) {
		lobby.popSong(lobby_id);

		if (lobbyRef.queue.length === 0) {
			lobby.setPlayStatusPaused(lobby_id);
			io.to(lobby_id).emit('emptyQueue', lobbyRef.queue);
		} else {
			io.to(lobby_id).emit('removeFirst', lobbyRef.queue, lobbyRef.playing);
		}
	} else {
		lobby.removeSong(index, lobby_id);
	}
	io.to(lobby_id).emit('addSong', lobbyRef.queue);
}

module.exports = {
	handleJoinLobby,
	handleDisconnect,
	handleLobbyMessage,
	handleUniSearch,
	handleAddSong,
	handleAddAlbumToQueue,
	handleSkip,
	handleSetDeviceId,
	handlePlayerData,
	handlePlay,
	handleMediaChange,
	handleRemove,
};
