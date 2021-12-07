const axios = require('axios');

// Returns basic headers required by almost every spotify api end point
function defaultHeader(token) {
	return {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + token,
		},
	};
}

// Perfoms a basic track and album search on spotify
async function search(searchValue, token) {
	const endPoint = '	https://api.spotify.com/v1/search';
	const config = {
		headers: defaultHeader(token).headers,
		params: {
			q: searchValue,
			type: 'album,track',
			limit: 5,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data;
	} catch (err) {
		// TODO
	}
}

// Perfoms a track search on spotify by query
async function searchForTrack(searchValue, token) {
	const endPoint = 'https://api.spotify.com/v1/search';
	const config = {
		headers: defaultHeader(token).headers,
		params: {
			q: searchValue,
			type: 'track',
			limit: 20,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data;
	} catch (err) {
		// TODO
	}
}

// Perfoms an album search on spotify by query
async function searchForAlbum(searchValue, token) {
	const endPoint = '	https://api.spotify.com/v1/search';
	const config = {
		headers: defaultHeader(token).headers,
		params: {
			q: searchValue,
			type: 'album',
			limit: 20,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data;
	} catch (err) {
		// TODO
	}
}

// Format song data for spotify player
function formatSongData(songData) {
	return songData.uri;
}

// Search for a song using apple data and return the id of the result
async function getAndFormatSongData(
	{ trackName, artists, uniId },
	spotifyToken
) {
	// Raw results directly from song and artist search by query
	const rawResults = await searchForTrack(
		`${trackName} ${artists}`,
		spotifyToken
	);

	// Attempt to find a song match by isrc

	//   rawResults.tracks.items.forEach((song) => {
	//     console.log(song.external_ids.isrc + " = " + uniId);
	//   });
	//
	const songMatch = rawResults.tracks.items.find(
		(song) => song.external_ids.isrc === uniId
	);

	// If found return the songs id
	if (songMatch) {
		console.log('FOUND!');
		return songMatch.uri;
	}
	console.log('NOT FOUND');
	return 0;
}

// Search for an album using apple data and return all the uri's if found
async function getAlbumId({ albumName, artists }, token) {
	// Raw results directly from album search by query
	const rawResults = await searchForAlbum(`${albumName} ${artists}`, token);

	// Attempt to find an album match by name
	const albumMatch = rawResults.albums.items.find(
		(album) => album.name === albumName
	);
	return albumMatch.id;
}

// Search for an album using apple data and return all the uri's if found
// async function albumSearchAndFormat({ albumName, artists }, token) {
// 	// Raw results directly from album search by query
// 	const rawResults = await searchForAlbum(`${albumName} ${artists}`, token);

// 	// Attempt to find an album match by name
// 	const albumMatch = rawResults.albums.items.find(
// 		(album) => album.name === albumName
// 	);

// 	// If we find a match get the album directly by id
// 	const spotifyAlbum = await spotifyAlbumSearchById(albumMatch.id, token);

// 	// Return all uris for songs in album
// 	return spotifyAlbum.items.map((track) => track.uri);
// }

// When this is called we already have the albums id
// Just grab the album directly by id and pull out the data for all songs in the albums
// TODO we dont have to search by id, just save all songs data in the front end when inital search is made
async function formatAlbumData(albumData, token) {
	// get album by id
	const results = await spotifyAlbumSearchById(albumData.id, token);

	// Data that will be used by player and ui
	let dataForSpotifyPlayer = [];
	let dataForUi = [];

	// Iterate through each song and grab necessary data
	results.items.forEach((track) => {
		// Data player needs
		dataForSpotifyPlayer.push(track.uri);
		// Data ui needs
		dataForUi.push({
			trackName: track.name,
			artists: track.artists.map(({ name }) => name).join(', '),
			trackCover: albumData.albumCover,
			id: track.id,
		});
	});

	// Return data required by spotify's player and data used by ui
	return { dataForSpotifyPlayer, dataForUi };
}

// Get album directly by id
async function spotifyAlbumSearchById(id, token) {
	const endPoint = `	https://api.spotify.com/v1/albums/${id}/tracks`;
	try {
		const res = await axios.get(endPoint, defaultHeader(token));
		return res.data;
	} catch (err) {
		// TODO
	}
}

async function setDevice({ device_id, token }) {
	const endPoint = `https://api.spotify.com/v1/me/player`;
	const body = {
		device_ids: [device_id],
	};

	try {
		await axios.put(endPoint, body, defaultHeader(token));
	} catch (err) {
		// TODO
	}
}

// Pause active player
async function pause({ token }) {
	const endPoint = `https://api.spotify.com/v1/me/player/pause`;

	try {
		return await axios.put(endPoint, {}, defaultHeader(token));
	} catch (err) {
		// console.log(err);
	}
}

// Get current player state
async function playerState(token) {
	const endPoint = `https://api.spotify.com/v1/me/player`;

	try {
		const res = await axios.get(endPoint, defaultHeader(token));
		return res.data;
	} catch (err) {
		// console.log(err);
	}
}

async function getTempToken() {
	const endPoint = 'http://localhost:8888/spotify/temp_token';

	try {
		const res = await axios.get(endPoint);
		return res.data;
	} catch (err) {
		// TODO
	}
}

async function getAlbumSongsUriByAlbumId(spotifyAlbumId, spotifyToken) {
	// If we find a match get the album directly by id
	const spotifyAlbumSongData = await spotifyAlbumSearchById(
		spotifyAlbumId,
		spotifyToken
	);
	// Return all uris for songs in album
	return spotifyAlbumSongData.items.map((track) => track.uri);
}

// Get the users id and create a playlist on their account and return playlist uri
// async function createTempPlaylist(token) {
// 	const user = await getUserData(token);
// 	const uri = await createPlaylist(token, user.data.id);
// 	return uri;
// }

// Get the users account data
// async function getUserData(token) {
// 	const endPoint = 'https://api.spotify.com/v1/me';

// 	try {
// 		const user = await axios.get(endPoint, defaultHeader(token));
// 		return user;
// 	} catch (err) {
// 		// TODO
// 	}
// }

// Creates a temp playlist on users account and returns the playlist uri
// async function createPlaylist(token, id) {
// 	const endPoint = `https://api.spotify.com/v1/users/${id}/playlists`;
// 	const body = {
// 		name: 'Listening Party!',
// 		description: 'A temporary playlist used for our app to work',
// 		public: false,
// 	};

// 	try {
// 		const res = await axios.post(endPoint, body, defaultHeader(token));
// 		return res.data.id;
// 	} catch (err) {
// 		// TODO
// 	}
// }

// Creates a temp playlist on users account and returns the playlist uri
// async function deletePlaylist(token, id) {
// 	const endPoint = `https://api.spotify.com/v1/playlists/${id}/followers`;

// 	try {
// 		await axios.delete(endPoint, defaultHeader(token));
// 	} catch (err) {
// 		// TODO
// 	}
// }

// Adds a song by id to the users temp playlist
// async function addSongToPlaylist(songId, user) {
// 	const { token, playlistId } = user;
// 	const endPoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
// 	const body = {
// 		uris: [`spotify:track:${songId}`],
// 	};

// 	try {
// 		await axios.post(endPoint, body, defaultHeader(token));
// 	} catch (err) {
// 		// TODO
// 	}
// }

// Adds an entire album to the users temp playlist by array of uris
// async function addAlbumToPlaylist(uriArray, user) {
// 	const { token, playlistId } = user;
// 	const endPoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
// 	const body = {
// 		uris: uriArray,
// 	};

// 	try {
// 		await axios.post(endPoint, body, defaultHeader(token));
// 	} catch (err) {
// 		// TODO
// 	}
// }

// Make request to spotify api to start the player
// async function playSong(token) {
// 	const endPoint = 'https://api.spotify.com/v1/me/player/play';
// 	try {
// 		await axios.put(endPoint, {}, defaultHeader(token));
// 	} catch (err) {
// 		// TODO
// 	}
// }

// Make request to spotify api to start the player
// async function pauseSong(token) {
// 	const endPoint = 'https://api.spotify.com/v1/me/player/pause';
// 	try {
// 		await axios.put(endPoint, {}, defaultHeader(token));
// 	} catch (err) {
// 		// TODO
// 	}
// }

// Make request to spotify api to start the player
// async function playNext(token) {
// 	const endPoint = 'https://api.spotify.com/v1/me/player/next';
// 	try {
// 		await axios.post(endPoint, {}, defaultHeader(token));
// 	} catch (err) {
// 		// TODO
// 	}
// }

// async function setPlaylistAndPlay(playlistId, token) {
// 	const devices = await getDevices(token);
// 	const player = devices.find((device) => device.name === 'Web Playback SDK');
// 	await setPlaybackToPlaylist(player.id, playlistId, token);
// }

// async function setPlaylistAndPlayNext(playlistId, token) {
// 	const devices = await getDevices(token);
// 	const player = devices.find((device) => device.name === 'Web Playback SDK');
// 	await setPlaybackToPlaylist(player.id, playlistId, token, 1);
// }

// async function getDevices(token) {
// 	const endPoint = 'https://api.spotify.com/v1/me/player/devices';

// 	try {
// 		const res = await axios.get(endPoint, defaultHeader(token));
// 		return res.data.devices;
// 	} catch (err) {
// 		// TODO
// 	}
// }

//TODO when play is hit for the first time set playback to the correct playlist
// async function setPlaybackToDevice(deviceId, id, token, offset = 0) {
// 	const endPoint = `https://api.spotify.com/v1/me/player`;
// 	const body = {
// 		context_uri: `spotify:playlist:${id}`,
// 		offset: {
// 			position: offset,
// 		},
// 		position_ms: 0,
// 	};

// 	try {
// 		await axios.put(endPoint, body, defaultHeader(token));
// 	} catch (err) {
// 		// TODO
// 	}
// }

module.exports = {
	// playSong,
	// pauseSong,
	// playNext,
	pause,
	search,
	playerState,
	// setPlaybackToDevice,
	// createTempPlaylist,
	// addSongToPlaylist,
	formatSongData,
	getAndFormatSongData,
	formatAlbumData,
	// addAlbumToPlaylist,
	setDevice,
	getTempToken,
	getAlbumId,
	getAlbumSongsUriByAlbumId,
	// deletePlaylist,
	// setPlaylistAndPlay,
	// setPlaylistAndPlayNext,
};
