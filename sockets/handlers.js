const lobby = require('./lobby');
const spotify = require('./spotify');
const helpers = require('./helpers');

// ---------- Handle when someone creates or joins lobby ----------
async function handleJoinLobby(io, socket, data) {
	const { lobby_id, username, music_provider, token } = data;
	data.user_id = socket.id;
	socket.join(lobby_id);

	// Set playlist id to new spotify playlist created on users account
	if (music_provider === 'spotify') {
		data.playlistId = await spotify.createTempPlaylist(token);
	}

	// Check if lobby exists and handle accordingly
	if (!lobby.lobbyExists(lobby_id)) {
		// Create and join lobby
		lobby.generateLobby(data);
		const members = [username];
		const messages = [];
		// Send new lobby data back to members
		io.to(lobby_id).emit('setLobbyInfo', members, messages);
	} else {
		// Join existing lobby
		lobby.joinLobby(data);
		const members = lobby.getMemberUsernames(lobby_id);
		const messages = lobby.getLobbyMessages(lobby_id);
		// Send new lobby data back to members
		// TODO send queue and ui queue to designated player
		io.to(lobby_id).emit('setLobbyInfo', members, messages);
	}
}

// ---------- Handle when someone leaves the lobby ----------
async function handleDisconnect(io, socket) {
	console.log('----- disconnection -----');
	// Get lobby data
	const lobbyRef = lobby.getLobbyByUserId(socket.id);
	// Get user that left data
	const user = lobbyRef.users.find((user) => user.user_id === socket.id);

	// If the member who left was using spotify delete the temp playlist they were using from their account
	if (user.music_provider === 'spotify') {
		await spotify.deletePlaylist(user.token, user.playlistId);
	}

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

// ---------- Handle adding song to queue ----------
async function handleAddSongToQueue(io, socket, data) {
	// Get lobby data
	const lobbyRef = lobby.getLobbyById(data.user.lobby_id);
	// Perform the necessary searches and return an object containing display for ui and data for each player
	const songDataForPlayers = await helpers.getSongDataForPlayers(
		lobbyRef.players,
		data
	);

	// Send ui and players the data
	sendSongToUi(io, data, lobbyRef);
	sendSongToPlayers(io, lobbyRef, songDataForPlayers);
}

// Display song on members ui
function sendSongToUi(io, { songData }, { lobby_id, queue }) {
	lobby.addSongToLobby(lobby_id, songData);
	io.to(lobby_id).emit('updateLobbyQueue', queue);
}

// Add song to members players
function sendSongToPlayers(
	io,
	lobbyRef,
	{ dataForSpotifyPlayer, dataForApplePlayer }
) {
	// for each member add song to their playlist
	lobbyRef.users.forEach((member) => {
		if (member.music_provider === 'spotify') {
			spotify.addSongToPlaylist(dataForSpotifyPlayer, member);
		} else {
			io.to(member.user_id).emit('updateAppleQueue', dataForApplePlayer);
		}
	});
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
	io.to(lobby_id).emit('updateLobbyQueue', queue);
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
			spotify.addAlbumToPlaylist(dataForSpotifyPlayer, user);
		} else {
			io.to(user.user_id).emit('updateAppleQueue', dataForApplePlayer);
		}
	});
}

// ---------- Handle when someone clicks play ----------
function handlePlaySong(io, socket, data) {
	// Get all members in lobby
	const members = lobby.getLobbyById(data.lobby_id).users;
	// Begin playing song for all members
	startSongForMembers(io, members);
}

// Begin playing the song for all members
function startSongForMembers(io, members) {
	// For each member play song on their player
	members.forEach(async ({ music_provider, token, user_id }) => {
		if (music_provider === 'spotify') {
			await spotify.playSong(token);
		} else {
			io.to(user_id).emit('playApple');
		}
	});
}

module.exports = {
	handleJoinLobby,
	handleDisconnect,
	handleLobbyMessage,
	handleUniSearch,
	handleAddSongToQueue,
	handleAddAlbumToQueue,
	handlePlaySong,
};
