const lobbyFunctions = require('./lobbyFunctions');
const spotifyFunctions = require('./spotifyFunctions');
const appleFunctions = require('./appleFunctions');
const {
	createNewLobby,
	joinLobby,
	lobbyExists,
	getUserById,
	getMemberUsernames,
	addMessageToLobby,
	getLobbyMessages,
	getLobbyById,
} = lobbyFunctions;
const { playSong } = spotifyFunctions;
const { searchSong } = appleFunctions;

function socketsHandler(io) {
	io.sockets.on('connection', function (socket) {
		console.log('----- connection -----');

		// Handle when someone creates lobby or joins lobby
		socket.on('joinLobby', (data) => {
			const { lobby_id, username } = data;
			data.user_id = socket.id;
			socket.join(lobby_id);

			if (!lobbyExists(lobby_id)) {
				createNewLobby(data);
				io.to(lobby_id).emit('setLobbyInfo', {
					members: [username],
					lobbyMessages: [],
				});
			} else {
				joinLobby(data);
				io.to(lobby_id).emit('setLobbyInfo', {
					members: getMemberUsernames(lobby_id),
					lobbyMessages: getLobbyMessages(lobby_id),
				});
			}
		});

		socket.on('disconnect', () => {
			console.log('----- disconnected -----');
		});

		// Handle when someone send a message in their lobby
		socket.on('message', ({ lobby_id, message }) => {
			const user = getUserById(lobby_id, socket.id);
			addMessageToLobby(lobby_id, message, user.username);
			io.to(lobby_id).emit(
				'lobbyMessage',
				getLobbyMessages(lobby_id)
			);
		});

		// Handle Apple search request
		socket.on('appleSearch', (data, setSearchResults) => {
			searchSong(data, setSearchResults);
		});

		// Handle when someone clicks play
		socket.on('playSong', (lobby_id) => {
			const members = getLobbyById(lobby_id).users;
			members.forEach(({ music_provider, token, user_id }) => {
				if (music_provider === 'spotify') {
					playSong(token);
				} else {
					io.to(user_id).emit('playApple');
				}
			});
		});
	});
}

module.exports = socketsHandler;
exports = module.exports;
