// Stores all lobbies
let lobbies = [];

// Generates a new lobby and admin
function createLobbyAndJoin(data, tempToken) {
	const newLobby = {
		lobby_id: data.lobby_id,
		users: [generateUser(data, 'admin')],
		queue: [],
		messages: [],
		tokens: generateTokens(data, tempToken),
		playing: false, // lobby is playing
		playback: false, // true: there is a song in queue and song is first in queue and duration is 0:00
		usersReady: [],
		loading: false,
		hold: null,
		timeout: false,
		usersReadyTimeout: false,
		loadingOverlapCount: 0,
		shuffleMode: false,
	};

	lobbies.push(newLobby);
}

// Generates a user with information passed in from the front end
function generateUser(data, privilege) {
	return {
		username: data.username,
		privilege: privilege,
		token: data.token,
		refresh_token: data.refresh_token,
		music_provider: data.music_provider,
		user_id: data.user_id,
		frontEndId: data.frontEndId,
	};
}

function getMostRecentlyJoined({ lobby_id, memberId }) {
	const lobby = getLobbyById(lobby_id);
	const i = lobby.users.findIndex((user) => user.user_id === memberId);
	return lobby.users[i];
}

// Creates object that keeps track of players in the lobby
function generateTokens({ music_provider, token, missingProviderToken }) {
	return music_provider === 'spotify'
		? {
				spotify: token,
				apple: missingProviderToken,
		  }
		: {
				spotify: missingProviderToken,
				apple: token,
		  };
}

// Check if lobby exists
function exists(lobby_id) {
	return getLobbyById(lobby_id);
}

function deleteLobbyByIndex(i) {
	lobbies.splice(i, 1);
}

// join new user into lobby
function joinUserIntoLobby(userData) {
	const newUser = generateUser(userData, 'guest');
	const i = getLobbyIndex(userData.lobby_id);
	lobbies[i].users.push(newUser);
}

// remove user from lobby when they disconnect
function leaveLobby(lobby, userId) {
	const j = lobby.users.findIndex((user) => user.user_id === userId);
	const i = getLobbyIndex(lobby.lobby_id);
	lobbies[i].users.splice(j, 1);
	return i;
}

// Get index of member in lobby
function getMemberIndex(members, memberId) {
	return members.findIndex((member) => member.user_id == memberId);
}

function getAdminData({ lobby_id }) {
	return getLobbyById(lobby_id).users.find(
		(user) => user.privilege === 'admin'
	);
}
function getShuffleData(lobby_id) {
	return getLobbyById(lobby_id).shuffleMode;
}

// Get index of passed lobby within lobbies array
function getLobbyIndex(lobby_id) {
	return lobbies.findIndex((lobby) => lobby.lobby_id == lobby_id);
}

// Get lobby data by its id
function getLobbyById(lobby_id) {
	const lobby = lobbies.find((lobby) => lobby.lobby_id == lobby_id);
	return lobby;
}

// Get lobby id by iterating through every lobby and every user, time: O(n), n = # of ALL users
function getLobbyByUserId(id) {
	return lobbies.find((lobby) => containsUserMatch(lobby.users, id));
}

function containsUserMatch(users, id) {
	return users.some((user) => user.user_id === id);
}

// Find the users data by first finding the lobby by id then the user by id
function getUserById(lobby_id, user_id) {
	return getLobbyById(lobby_id).users.find((user) => user.user_id == user_id);
}

// Get all members usernames by first finding the lobb by id then iterating through the users
function getMemberUsernames(lobby_id) {
	return getLobbyById(lobby_id).users.map((user) => user.username);
}

// Get all members by first finding the lobby by id then iterating through the users
function getMembers(lobby_id) {
	return getLobbyById(lobby_id).users.map((user) => user);
}

// Get lobbies messages by first finding the lobby by id then grabbing the messages
function getLobbyMessages(lobby_id) {
	return getLobbyById(lobby_id).messages;
}

// Sets players status to true
function setStatusToPlaying(lobbyId) {
	const i = getLobbyIndex(lobbyId);
	lobbies[i].players.playing = true;
}

// Sets players status to false
function setStatusToPaused(lobbyId) {
	const i = getLobbyIndex(lobbyId);
	lobbies[i].players.playing = false;
}

function setDeviceId(memberId, { lobby_id, device_id }) {
	const i = getLobbyIndex(lobby_id);
	const lobby = lobbies[i];
	const j = getMemberIndex(lobby.users, memberId);
	lobbies[i].users[j].deviceId = device_id;
}

function setShuffleMode(lobby_id) {
	const lobby = getLobbyById(lobby_id);
	lobby.shuffleMode = !lobby.shuffleMode;
	return lobby.shuffleMode;
}

function shuffleQueue(lobby_id) {
	const lobbyRef = getLobbyById(lobby_id);
	let lobbyQueue = lobbyRef.queue;
	if (lobbyQueue.length > 0) {
		const randomIndex = Math.floor(Math.random() * lobbyRef.queue.length);
		let firstSong = lobbyQueue[randomIndex];
		lobbyQueue.splice(randomIndex, 1);
		lobbyQueue.unshift(firstSong);
	}
	return lobbyQueue;
}

function setFirstSongTo(index, lobby_id) {
	const lobbyRef = getLobbyById(lobby_id);
	let lobbyQueue = lobbyRef.queue;

	let newFirstSong = lobbyQueue[index];
	lobbyQueue.splice(index, 1);
	lobbyQueue.unshift(newFirstSong);
}

// Adds a message to the lobby by first finding the lobbies index then inserting the new message to the lobby
function addMessageToLobby(message, lobbyId) {
	const i = getLobbyIndex(lobbyId);
	lobbies[i].messages.push(message);
	return lobbies[i].messages;
}

// Adds song to lobby by first finding the index then adding the song to the lobby queue
function addSongToLobby(
	lobby_id,
	{ dataForSpotifyPlayer, dataForApplePlayer, dataForUi }
) {
	const i = getLobbyIndex(lobby_id);

	lobbies[i].queue.push({
		ui: dataForUi,
		spotify: dataForSpotifyPlayer,
		apple: dataForApplePlayer,
	});
}

// Adds album to lobby by first finding the index then adding each song to the lobby queue
function addAlbumToLobby(
	lobby_id,
	{ dataForSpotifyPlayer, dataForApplePlayer, dataForUi }
) {
	const i = getLobbyIndex(lobby_id);

	for (let j = 0; j < dataForUi.length; ++j) {
		const spotify = dataForSpotifyPlayer ? dataForSpotifyPlayer[j] : '-1';
		const apple = dataForApplePlayer ? dataForApplePlayer[j] : '-1';
		lobbies[i].queue.push({
			ui: dataForUi[j],
			spotify,
			apple,
		});
	}
}

function popSong(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].queue.splice(0, 1);
}

function updatePlayStatus(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	if (lobbies[i].playing === true) {
		lobbies[i].playing = false;
	} else {
		lobbies[i].playing = true;
	}
	return lobbies[i].playing;
}
//Turns playback to true; Playback is if our player is in a playing state
function playbackOn(lobby_id) {
	const lobby = getLobbyById(lobby_id);
	lobby.playback = true;
}
//Turns playback to false; Playback is if our player is in a playing state
function playbackOff(lobby_id) {
	const lobby = getLobbyById(lobby_id);
	lobby.playback = false;
}

function setPlayStatusPaused(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].playing = false;
}

function setPlayStatusPlaying(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].playing = true;
}

function removeSong(index, lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].queue.splice(index, 1);
}

function resetReady(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].usersReady = [];
}

function setLobbyLoading(lobby_id, value) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].loading = value;
}

function setFirstMemberAsAdmin(i) {
	lobbies[i].users[0].privilege = 'admin';
}

function setAlbumHold(lobby_id, allSongData) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].hold = allSongData;
}

function getAndRemoveHold(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	const albumHold = lobbies[i].hold;
	lobbies[i].hold = null;
	return albumHold;
}

function setTimeoutTo(lobby_id, value) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].timeout = value;
}

function inTimeout(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	return lobbies[i].timeout;
}

function setUsersToken(lobby_id, user_id, newToken) {
	const i = getLobbyIndex(lobby_id);
	const lobby = lobbies[i];
	const j = getMemberIndex(lobby.users, user_id);
	lobbies[i].users[j].token = newToken;
}

function setTempToken(lobby_id, newToken) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].tokens.spotify = newToken;
}

function addUserToReady(user) {
	const i = getLobbyIndex(user.lobby_id);
	lobbies[i].usersReady.push(user);
}

function setUsersReadyTimeoutActive(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].usersReadyTimeout = true;
}

function setUsersReadyTimeoutOff(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].usersReadyTimeout = false;
}

function incremenetLoadingOverlap(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].loadingOverlapCount += 1;
}

function setLoadingOverlapToZero(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].loadingOverlapCount = 0;
}

module.exports = {
	setPlayStatusPlaying,
	setPlayStatusPaused,
	updatePlayStatus,
	createLobbyAndJoin,
	exists,
	getLobbyById,
	createLobbyAndJoin,
	getUserById,
	getMemberUsernames,
	addMessageToLobby,
	getLobbyMessages,
	addSongToLobby,
	getLobbyByUserId,
	leaveLobby,
	deleteLobbyByIndex,
	setStatusToPlaying,
	setStatusToPaused,
	setDeviceId,
	getAdminData,
	getMostRecentlyJoined,
	popSong,
	removeSong,
	addAlbumToLobby,
	resetReady,
	setLobbyLoading,
	setFirstMemberAsAdmin,
	setAlbumHold,
	getAndRemoveHold,
	setTimeoutTo,
	inTimeout,
	getMembers,
	setUsersToken,
	setTempToken,
	addUserToReady,
	setUsersReadyTimeoutActive,
	setUsersReadyTimeoutOff,
	incremenetLoadingOverlap,
	setLoadingOverlapToZero,
	setShuffleMode,
	shuffleQueue,
	playbackOff,
	playbackOn,
	setFirstSongTo,
	joinUserIntoLobby,
	getShuffleData,
};
