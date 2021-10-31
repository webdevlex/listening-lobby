let lobbies = [];

function generateUser(data, privilege) {
	const { username, token, refresh_token, music_provider, user_id } =
		data;
	return {
		user_id: user_id,
		username: username,
		token: token,
		refresh_token: refresh_token,
		device_id: '',
		music_provider: music_provider,
		privilege: privilege,
	};
}

function createNewLobby(data) {
	const { lobby_id } = data;
	const newUser = generateUser(data, 'admin');
	const newLobby = {
		lobby_id: lobby_id,
		users: [newUser],
		queue: [],
		messages: [],
	};

	lobbies.push(newLobby);
}

function getLobbyIndex(lobby_id) {
	return lobbies.findIndex((lobby) => lobby.lobby_id == lobby_id);
}

function joinLobby(data) {
	const { lobby_id } = data;
	const lobbyIndex = getLobbyIndex(lobby_id);
	const newUser = generateUser(data, 'guest');
	lobbies[lobbyIndex].users.push(newUser);
}

function getLobbyById(lobby_id) {
	const test = lobbies.find((lobby) => lobby.lobby_id == lobby_id);
	return test;
}

function lobbyExists(lobby_id) {
	const lobby = getLobbyById(lobby_id);
	if (lobby) {
		return true;
	} else {
		return false;
	}
}

function getUserById(lobby_id, user_id) {
	const lobby = getLobbyById(lobby_id);
	return lobby.users.find((user) => user.user_id == user_id);
}

function getMemberUsernames(lobby_id) {
	const members = getLobbyById(lobby_id).users;
	return members.map((user) => user.username);
}

function getLobbyMessages(lobby_id) {
	return getLobbyById(lobby_id).messages;
}

function formatMessage(username, message) {
	return {
		username: username,
		message: message,
	};
}

function addMessageToLobby(lobby_id, message, username) {
	const lobbyIndex = getLobbyIndex(lobby_id);
	const formattedMessage = formatMessage(username, message);
	lobbies[lobbyIndex].messages.push(formattedMessage);
}

module.exports = {
	createNewLobby,
	lobbyExists,
	getLobbyById,
	joinLobby,
	getUserById,
	getMemberUsernames,
	addMessageToLobby,
	getLobbyMessages,
};
exports = module.exports;