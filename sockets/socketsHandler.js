const lobbyFunctions = require('./lobbyFunctions');
const spotifyFunctions = require('./spotifyFunctions');
const { setupSpotifyUsersPlaylist } = spotifyFunctions;
const {
	createNewLobby,
	joinLobby,
	lobbyExists,
	getMemberUsernames,
	getLobbyMessages,
} = lobbyFunctions;

async function handleJoinLobby(io, socket, data) {
	const { lobby_id, username, music_provider, token } = data;
	data.user_id = socket.id;
	socket.join(lobby_id);

	if (music_provider === 'spotify') {
		const playlistId = await setupSpotifyUsersPlaylist(token);
		data.playlistId = playlistId;
	}

	if (!lobbyExists(lobby_id)) {
		createNewLobby(data);
		io.to(lobby_id).emit('setLobbyInfo', {
			members: [username],
			lobbyMessages: [],
		});
	} else {
		joinLobby(data);
		// TODO also send queue to designated player and ui queue
		io.to(lobby_id).emit('setLobbyInfo', {
			members: getMemberUsernames(lobby_id),
			lobbyMessages: getLobbyMessages(lobby_id),
		});
	}
}

function handleDisconnect(io, socket) {
	console.log('----- disconnected -----');
}

module.exports = { handleJoinLobby, handleDisconnect };
