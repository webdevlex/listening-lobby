const axios = require('axios');

function playSong(token) {
	axios
		.put(
			'https://api.spotify.com/v1/me/player/play',
			{},
			{
				headers: {
					Accept: 'application/json',
					'content-type': 'application/json',
					Authorization: 'Bearer ' + token,
				},
			}
		)
		.then((response) => {
			// console.log('Player Started!');
		})
		.catch((error) => {
			// console.log('Player start failed...');
		});
}

async function spotfiySearchAndFormat(song, spotifyToken) {
	const { trackName, artists, uniId } = song;
	const searchValue = `${trackName} ${artists}`;
	const searchResult = await spotifySearch(searchValue, spotifyToken);
	const result = searchResult.tracks.items.find(
		(song) => song.external_ids.isrc === uniId
	);
	return result.id;
}

function formatSongForSpotify(song) {
	return song.id;
}

async function spotifySearch(searchValue, token) {
	const endPoint = '	https://api.spotify.com/v1/search';
	const config = {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + token,
		},
		params: {
			q: searchValue,
			type: 'album,track',
			limit: '5',
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data;
	} catch (err) {
		console.log(err.response.status);
	}
}

async function setupSpotifyUsersPlaylist(token) {
	const user = await getUserData(token);
	const uri = await createPlaylist(token, user.data.id);
	return uri;
}

async function getUserData(token) {
	const endPoint = 'https://api.spotify.com/v1/me';
	const config = {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + token,
		},
	};

	try {
		const user = await axios.get(endPoint, config);
		return user;
	} catch (err) {
		console.log(err);
	}
}

async function createPlaylist(token, id) {
	const endPoint = `https://api.spotify.com/v1/users/${id}/playlists`;
	const body = {
		name: 'Listening Party!',
		description: 'A temporary playlist used for our app to work',
		public: false,
	};
	const config = {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + token,
		},
	};

	try {
		const res = await axios.post(endPoint, body, config);
		return res.data.id;
	} catch (err) {
		console.log(err);
	}
}

async function addSongToPlaylist(songId, user) {
	const { token, playlistId } = user;
	const endPoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
	const body = {
		uris: [`spotify:track:${songId}`],
	};
	const config = {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + token,
		},
	};

	try {
		await axios.post(endPoint, body, config);
	} catch (err) {
		console.log(err);
	}
}

//TODO when first song in queue is added
async function setPlaybackToNewPlaylist(device_id, uri, token) {
	const endPoint = 'https://api.spotify.com/v1/me/player/play';
	const body = {
		device_id: device_id,
		context_uri: uri,
		offset: {
			position: 0,
		},
		position_ms: 0,
	};
	const config = {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + token,
		},
	};

	try {
		const res = await axios.put(endPoint, body, config);
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	playSong,
	spotifySearch,
	setupSpotifyUsersPlaylist,
	addSongToPlaylist,
	formatSongForSpotify,
	spotfiySearchAndFormat,
};
exports = module.exports;
