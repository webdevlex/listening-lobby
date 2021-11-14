const lobbyFunctions = require('./lobbyFunctions');
const spotifyFunctions = require('./spotifyFunctions');
const helperFunctions = require('./helperFunctions');
const appleFunctions = require('./appleFunctions');
const {
	createTempSpotifyPlaylist,
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
	addMessageToLobby,
	getLobbyById,
	addSongToLobbyQueue,
} = lobbyFunctions;
const {
	performDesignatedSongSearches,
	performDesignatedAlbumSearches,
	formatSearchResults,
	uniSearch,
} = helperFunctions;

// Handle when someone creates or joins lobby
async function handleJoinLobby(io, socket, data) {
	const { lobby_id, username, music_provider, token } = data;
	data.user_id = socket.id;
	socket.join(lobby_id);

	// Create temp spotify playlist on users account and set playlist id
	if (music_provider === 'spotify') {
		data.playlistId = await createTempSpotifyPlaylist(token);
	}

	// Check if lobby exists and handle accordingly
	if (!lobbyExists(lobby_id)) {
		createNewLobby(data);
		const members = [username];
		const messages = [];
		io.to(lobby_id).emit('setLobbyInfo', members, messages);
	} else {
		joinLobby(data);
		const members = getMemberUsernames(lobby_id);
		const messages = getLobbyMessages(lobby_id);
		// TODO send queue and ui queue to designated player
		io.to(lobby_id).emit('setLobbyInfo', members, messages);
	}
}

// TODO: make sure used players gets updated on leave
function handleDisconnect(io, socket) {
	console.log('----- disconnected -----');
}

// Handle when someone sends a lobby message
function handleLobbyMessage(io, socket, data) {
	// Add message to lobby and update everyones ui
	const messages = addMessageToLobby(data);
	io.to(data.user.lobby_id).emit('lobbyMessage', messages);
}

// Handle Spotify and apple search request
async function handleUniSearch(io, socket, data) {
	// Perform initial search
	let searchResults = await uniSearch(data);
	// Format results for front-end
	const formattedSearchResults = formatSearchResults(searchResults, data);
	io.to(socket.id).emit('uniSearchResults', formattedSearchResults);
}

// Handle adding song to queue
async function handleAddSongToQueue(io, socket, data) {
	const { song, user } = data;
	const lobby_id = user.lobby_id;
	const { players, users, queue } = getLobbyById(lobby_id);
	const { spotifySong, appleSong } = await performDesignatedSongSearches(
		players,
		user,
		song
	);

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

	allTracksDisplay.forEach((track) => addSongToLobbyQueue(lobby_id, track));
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
