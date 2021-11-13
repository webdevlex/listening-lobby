const lobbyFunctions = require('./lobbyFunctions');
const spotifyFunctions = require('./spotifyFunctions');
const helperFunctions = require('./helperFunctions');
const appleFunctions = require('./appleFunctions');
const {
	setupSpotifyUsersPlaylist,
	spotifySearch,
	playSong,
	addSongToPlaylist,
	addAlbumToPlaylist,
} = spotifyFunctions;
const {
	createNewLobby,
	joinLobby,
	lobbyExists,
	getMemberUsernames,
	getLobbyMessages,
	getUserById,
	addMessageToLobby,
	getLobbyById,
	addSongToLobbyQueue,
} = lobbyFunctions;
const { appleSearch } = appleFunctions;
const {
	performDesignatedSongSearches,
	performDesignatedAlbumSearches,
	formatSearhQueryForApple,
	formatSearchResults,
} = helperFunctions;

// Handle when someone creates or joins lobby
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

// TODO: make sure used players gets updated on leave
function handleDisconnect(io, socket) {
	console.log('----- disconnected -----');
}

// Handle when someone send a message in their lobby
function handleLobbyMessage(io, socket, data) {
	const { lobby_id, message } = data;
	const user = getUserById(lobby_id, socket.id);
	addMessageToLobby(lobby_id, message, user.username);
	io.to(lobby_id).emit('lobbyMessage', getLobbyMessages(lobby_id));
}

// Handle Spotify and apple search request
async function handleUniSearch(io, socket, data) {
	const token = data.token;
	const music_provider = data.user.music_provider;
	let searchValue = data.searchValue;
	let searchResults;

	if (music_provider === 'spotify') {
		searchResults = await spotifySearch(searchValue, token);
	} else {
		searchValue = formatSearhQueryForApple(searchValue);
		searchResults = await appleSearch(searchValue, token);
	}

	const formattedSearchResults = formatSearchResults(
		searchResults,
		music_provider
	);

	io.to(socket.id).emit('uniSearchResults', formattedSearchResults);
}

// Handle adding song to queue
async function handleAddSongToQueue(io, socket, data) {
	const { song, user } = data;
	const lobby_id = user.lobby_id;
	const { players, users, queue } = getLobbyById(lobby_id);
	const { spotifySong, appleSong } =
		await performDesignatedSongSearches(players, user, song);

	addSongToLobbyQueue(lobby_id, song);
	io.to(lobby_id).emit('updateLobbyQueue', queue);

	users.forEach((user) => {
		if (user.music_provider === 'spotify') {
			addSongToPlaylist(spotifySong, user);
		} else {
			io.to(user.user_id).emit('updateAppleQueue', appleSong);
		}
	});
}

// Handle adding album to queue
async function handleAddAlbumToQueue(io, socket, data) {
	const { album, user } = data;
	const lobby_id = user.lobby_id;
	const { players, users, queue } = getLobbyById(lobby_id);

	const { spotifyAlbum, appleAlbum, allTracksDisplay } =
		await performDesignatedAlbumSearches(players, user, album);

	allTracksDisplay.forEach((track) =>
		addSongToLobbyQueue(lobby_id, track)
	);
	io.to(lobby_id).emit('updateLobbyQueue', queue);

	users.forEach((user) => {
		if (user.music_provider === 'spotify') {
			addAlbumToPlaylist(spotifyAlbum, user);
		} else {
			io.to(user.user_id).emit('updateAppleQueue', appleAlbum);
		}
	});
}

// Handle when someone clicks play
function handlePlaySong(io, socket, data) {
	const lobby_id = data.lobby_id;
	const members = getLobbyById(lobby_id).users;
	members.forEach(({ music_provider, token, user_id }) => {
		if (music_provider === 'spotify') {
			playSong(token);
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
