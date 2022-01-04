const lobby = require('./lobby');
const helpers = require('./helpers');
const user = require('./user');
const apple = require('./apple');
const spotify = require('./spotify');

const KICK_WAIT_TIME_IN_MILLIS = 30000;
const ARTIST_SEARCH_RESULTS_AMOUNT = 25;
const LOBBY_MAX_CAPACITY = 8;

// ================
// = Attempt Join =
// ================
async function attemptJoinLobby(io, socket, userData) {
	userData = assignUserAnId(userData, socket.id);
	socket.join(userData.lobby_id);

	if (lobby.exists(userData.lobby_id)) {
		joinLobby(io, socket, userData.lobby_id, userData);
	} else {
		createLobby(io, userData);
	}
}

function assignUserAnId(data, id) {
	data.user_id = id;
	return data;
}

function joinLobby(io, socket, lobby_id, userData) {
	const lobbyData = lobby.getLobbyById(lobby_id);
	lobby.joinUserIntoLobby(userData);

	if (maxCapacityReached(lobbyData)) {
		kickNewUser(io, userData.user_id);
	} else {
		setLobbyToLoadingIfNotAlready(io, socket, lobbyData);
		deactivateLobbyButtons(io, lobby_id);
		showNewUserInLobby(io, lobbyData);
		sendNewUserTheQueueAndMessages(io, lobbyData, userData.user_id);
		requestAdminsPlayerStatusAndLetNewUserKnowWhoIsAdmin(io, userData);
		sendOperatorMessage(io, `${userData.username} joined the lobby!`, lobby_id);
	}
}

async function createLobby(io, userData) {
	const missingProviderToken = await helpers.getMissingProviderToken(
		userData.music_provider
	);
	userData.missingProviderToken = missingProviderToken;
	lobby.createLobbyAndJoin(userData);

	const members = lobby.getMembers(userData.lobby_id);
	const messages = [];
	const adminData = lobby.getAdminData(userData);

	io.to(userData.lobby_id).emit('setLobbyInfo', members, messages);
	io.to(userData.lobby_id).emit('doneLoading', {});
	io.to(userData.lobby_id).emit('setAdmin', adminData.user_id);
	sendOperatorMessage(io, 'Welcome to the listening lobby!', userData.lobby_id);
}

function maxCapacityReached(lobbyData) {
	return lobbyData.users.length > LOBBY_MAX_CAPACITY;
}

function kickNewUser(io, user_id) {
	io.to(user_id).emit('lobbyMaxReached');
}

function setLobbyToLoadingIfNotAlready(io, socket, lobbyData) {
	const lobbyNotLoading = !lobbyData.loading;
	if (lobbyNotLoading) {
		setLobbyToLoading(io, lobbyData.lobby_id);
		socket.broadcast.emit('getUserReady');
	}
}

function showNewUserInLobby(io, lobbyData) {
	io.to(lobbyData.lobby_id).emit('setMembers', lobbyData.users);
}

function sendNewUserTheQueueAndMessages(io, lobbyData, user_id) {
	// const messages = lobby.getLobbyMessages(lobbyData.lobby_id);
	io.to(user_id).emit('lobbyMessage', lobbyData.messages);
	io.to(user_id).emit('addSong', lobbyData.queue);
}

function requestAdminsPlayerStatusAndLetNewUserKnowWhoIsAdmin(io, userData) {
	const adminData = lobby.getAdminData(userData);
	io.to(userData.lobby_id).emit('setAdmin', adminData.user_id);
	io.to(adminData.user_id).emit('getPlayerData', userData.user_id);
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
	sendOperatorMessage(
		io,
		`${member.username} left the lobby.`,
		lobbyRef.lobby_id
	);

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
		if (lobbyRef.usersReady.length === lobbyRef.users.length) {
			io.to(lobbyRef.lobby_id).emit('activateButtons');
			lobby.resetReady(lobbyRef.lobby_id);
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
	setLobbyToLoading(io, data.user.lobby_id);

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
		setLobbyToNotLoading(data.user.lobby_id);
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
	setLobbyToLoading(io, data.user.lobby_id);

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
		io.to(socket.id).emit('addCheck', data.albumData.id);

		if (firstSong) {
			io.to(data.user.lobby_id).emit('firstSong', lobbyRef.queue);
		} else {
			setLobbyToNotLoading(data.user.lobby_id);
			io.to(data.user.lobby_id).emit('activateButtons');
		}
	} else {
		allSongData.albumId = data.albumData.id;
		lobby.setAlbumHold(data.user.lobby_id, allSongData);
		setLobbyToNotLoading(data.user.lobby_id);
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
		setLobbyToLoading(io, user.lobby_id);

		if (play) {
			io.to(user.lobby_id).emit('play', lobbyRef.queue[0]);
		} else {
			io.to(user.lobby_id).emit('pause', lobbyRef.queue[0]);
		}
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
		sendOperatorMessage(
			io,
			`${user.username} skipped the song.`,
			lobbyRef.lobby_id
		);
		setLobbyToLoading(io, user.lobby_id);

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
			setLobbyToLoading(io, user.lobby_id);

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
		if (lobby.lobbyExists(lobby_id)) {
			lobby.setTimeoutTo(lobby_id, false);
		}
	}, 10000);
}

// ================
// = Remove Song =
// ================
function remove(io, socket, { index, user, songName }) {
	const lobby_id = user.lobby_id;
	const lobbyRef = lobby.getLobbyById(lobby_id);
	io.to(lobby_id).emit('deactivateButtons');
	setLobbyToLoading(io, lobby_id);

	const isFirstSong = index === 0;
	if (isFirstSong) {
		lobby.popSong(lobby_id);

		if (lobbyRef.queue.length === 0) {
			lobby.setPlayStatusPaused(lobby_id);
			io.to(lobby_id).emit('emptyQueue', lobbyRef.queue);
		} else {
			io.to(lobby_id).emit('removeFirst', lobbyRef.queue, lobbyRef.playing);
		}
	} else {
		io.to(lobby_id).emit('activateButtons');
		setLobbyToNotLoading(lobby_id);
		lobby.removeSong(index, lobby_id);
	}
	io.to(lobby_id).emit('addSong', lobbyRef.queue);
	sendOperatorMessage(io, `${user.username} removed ${songName}.`, lobby_id);
}

// ==============
// = User Ready =
// ==============
function userReady(io, socket, { user }) {
	const lobbyRef = lobby.getLobbyById(user.lobby_id);
	user.user_id = socket.id;
	lobby.addUserToReady(user);

	if (lobbyRef.usersReady.length === lobbyRef.users.length) {
		console.log('--------- everyone done loading ----------');
		io.to(user.lobby_id).emit('activateButtons');
		setLobbyToNotLoading(user.lobby_id);
		lobby.resetReady(user.lobby_id);
	}
}

function setLobbyToNotLoading(lobby_id) {
	lobby.setLobbyLoading(lobby_id, false);
	clearInterval(kickAfterTimeInterval);
	kickAfterTimeInterval = null;
}

function setLobbyToLoading(io, lobby_id) {
	lobby.setLobbyLoading(lobby_id, true);
	waitSomeTimeThenKickAnyoneWhoIsNotReady(io, lobby_id);
}

let kickAfterTimeInterval = null;
function waitSomeTimeThenKickAnyoneWhoIsNotReady(io, lobby_id) {
	kickAfterTimeInterval = setTimeout(() => {
		if (lobby.lobbyExists(lobby_id)) {
			const lobbyRef = lobby.getLobbyById(lobby_id);
			const usersWhoAreReady = lobbyRef.usersReady;
			const allUsers = lobbyRef.users;
			const usersWhoWillBeKicked = allUsers.filter(
				({ user_id }) => !containMatch(usersWhoAreReady, user_id)
			);
			kickUsers(io, usersWhoWillBeKicked);
		}
	}, KICK_WAIT_TIME_IN_MILLIS);
}

function containMatch(arrayToCheck, idWeAreLookingFor) {
	return arrayToCheck.some(({ user_id }) => user_id === idWeAreLookingFor);
}

function kickUsers(io, users) {
	users.forEach(({ user_id, username }) => {
		io.to(user_id).emit('kickUser');
	});
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
	setLobbyToLoading(io, user.lobby_id);

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
		setLobbyToNotLoading(user.lobby_id);
		io.to(user.lobby_id).emit('activateButtons');
	}
}

function sendOperatorMessage(io, message, lobby_id) {
	const formattedMessage = helpers.formatMessage('Listening Lobby', message);
	const messages = lobby.addMessageToLobby(formattedMessage, lobby_id);
	io.to(lobby_id).emit('lobbyMessage', messages);
}

// =================
// = Artist Search =
// =================
async function artistSearch(io, socket, data) {
	let searchResults = await helpers.uniSearch(
		data,
		ARTIST_SEARCH_RESULTS_AMOUNT
	);
	const formattedResults = helpers.formatUniSearchResults(searchResults, data);
	io.to(socket.id).emit('uniSearchResults', formattedResults);
}

// ====================
// = Get Album Tracks =
// ====================
async function getAlbumTracks(io, socket, data) {
	const { album, user: userRef } = data;
	const { lobby_id } = userRef;
	const { albumCover, id: albumId } = album;
	const userData = lobby.getUserById(lobby_id, socket.id);

	if (user.usingSpotify(userData)) {
		const tracks = await spotify.getAlbumTracks(albumId, userData);
		const formattedTracks = helpers.formatTracksForDisplayingAlbum(
			tracks,
			albumCover
		);
		io.to(socket.id).emit('displayAlbum', formattedTracks);
	} else {
		const test = await apple.getAlbumTracks(albumId, userData);
		console.log(test);
	}
}

function deactivateLobbyButtons(io, lobby_id) {
	io.to(lobby_id).emit('deactivateButtons');
}

module.exports = {
	attemptJoinLobby,
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
	artistSearch,
	getAlbumTracks,
};
