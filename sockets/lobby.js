let lobbies = [];

function generateUser(data, privilege) {
	const {
		username,
		token,
		refresh_token,
		music_provider,
		user_id,
		playlistId,
	} = data;
	return {
		user_id: user_id,
		username: username,
		token: token,
		refresh_token: refresh_token,
		music_provider: music_provider,
		privilege: privilege,
		playlistId: playlistId,
	};
}

function createNewLobby(data) {
	const lobby_id = data.lobby_id;
	const newUser = generateUser(data, 'admin');
	const newLobby = {
		lobby_id: lobby_id,
		users: [newUser],
		queue: [],
		messages: [],
		players: createPlayersObject(data),
	};

	lobbies.push(newLobby);
}

function createPlayersObject(data) {
	const { music_provider, token } = data;
	return music_provider === 'spotify'
		? {
				spotify: {
					token: token,
					count: 1,
				},
				apple: {
					token: '',
					count: 0,
				},
		  }
		: {
				spotify: {
					token: '',
					count: 0,
				},
				apple: {
					token: token,
					count: 1,
				},
		  };
}

function getLobbyIndex(lobby_id) {
	return lobbies.findIndex((lobby) => lobby.lobby_id == lobby_id);
}

function joinLobby(data) {
	const lobby_id = data.lobby_id;
	const lobbyIndex = getLobbyIndex(lobby_id);
	const newUser = generateUser(data, 'guest');
	addDesignatedPlayer(lobbyIndex, data);
	lobbies[lobbyIndex].users.push(newUser);
}

function addDesignatedPlayer(lobbyIndex, data) {
	const { music_provider, token } = data;
	const { spotify, apple } = lobbies[lobbyIndex].players;
	const bothPlayersUsed = spotify.count > 0 && apple.count > 0;
	const primaryPlayer = spotify.count > 0 ? 'spotify' : 'apple';

	if (!bothPlayersUsed && primaryPlayer !== music_provider) {
		if (music_provider === 'spotify') {
			lobbies[lobbyIndex].players.spotify.count += 1;
			lobbies[lobbyIndex].players.spotify.token = token;
		} else {
			lobbies[lobbyIndex].players.apple.count += 1;
			lobbies[lobbyIndex].players.apple.token = token;
		}
	} else {
		if (music_provider === 'spotify') {
			lobbies[lobbyIndex].players.spotify.count += 1;
		} else {
			lobbies[lobbyIndex].players.apple.count += 1;
		}
	}
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

function addMessageToLobby({ user, message }) {
	const lobbyIndex = getLobbyIndex(user.lobby_id);
	const formattedMessage = formatMessage(user.username, message);
	lobbies[lobbyIndex].messages.push(formattedMessage);
	return lobbies[lobbyIndex].messages;
}

function addSongToLobby(lobby_id, song) {
	const lobbyIndex = getLobbyIndex(lobby_id);
	lobbies[lobbyIndex].queue.push(song);
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
	addSongToLobby,
};
exports = module.exports;
