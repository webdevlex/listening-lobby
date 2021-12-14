// Stores all lobbies
let lobbies = [];

// Generates a new lobby and admin
function generateLobby(data, tempToken) {
	const newLobby = {
		lobby_id: data.lobby_id,
		users: [generateUser(data, 'admin')],
		queue: [],
		messages: [],
		tokens: generateTokens(data, tempToken),
		playing: false,
		usersReady: 0,
		loading: false,
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
	};
}

function getMostRecentlyJoined({ lobby_id, memberId }) {
	const lobby = getLobbyById(lobby_id);
	const i = lobby.users.findIndex((user) => user.user_id === memberId);
	return lobby.users[i];
}

// Creates object that keeps track of players in the lobby
function generateTokens({ music_provider, token }, tempToken) {
	return music_provider === 'spotify'
		? {
				spotify: token,
				apple: tempToken,
		  }
		: {
				spotify: tempToken,
				apple: token,
		  };
}

// Check if lobby exists
function lobbyExists(lobby_id) {
	return getLobbyById(lobby_id);
}

function deleteLobbyByIndex(i) {
	lobbies.splice(i, 1);
}

// join new user into lobby
function joinLobby(data) {
	const newUser = generateUser(data, 'guest');
	const i = getLobbyIndex(data.lobby_id);
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
		lobbies[i].queue.push({
			ui: dataForUi[j],
			spotify: dataForSpotifyPlayer[j],
			apple: dataForApplePlayer[j],
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

function increaseReadyCount(user) {
	const i = getLobbyIndex(user.lobby_id);
	lobbies[i].usersReady += 1;
}

function resetReadyCount(lobby_id) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].usersReady = 0;
}

function setLobbyLoading(lobby_id, value) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].loading = value;
}

function setFirstMemberAsAdmin(i) {
	lobbies[i].users[0].privilege = 'admin';
}

module.exports = {
	setPlayStatusPlaying,
	setPlayStatusPaused,
	updatePlayStatus,
	generateLobby,
	lobbyExists,
	getLobbyById,
	joinLobby,
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
	increaseReadyCount,
	resetReadyCount,
	setLobbyLoading,
	setFirstMemberAsAdmin,
};
