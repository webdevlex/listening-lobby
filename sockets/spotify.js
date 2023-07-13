const axios = require('axios');
const lobby = require('./lobby');

const UNAUTHORIZED_ERROR_CODE = 401;

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
async function search(params) {
	const { searchValue, token, searchAmount } = params;
	const endPoint = 'https://api.spotify.com/v1/search';
	const config = {
		headers: defaultHeader(token).headers,
		params: {
			q: searchValue,
			type: 'album,track',
			limit: searchAmount,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		res.data.refreshOccured = false;
		return res.data;
	} catch (err) {
		const refreshTokenError = err.response.status === UNAUTHORIZED_ERROR_CODE;
		if (refreshTokenError) {
			return await handleRefreshToken(params, search);
		}
	}
}

// Search for a song using apple data and return the id of the result
async function getAndFormatSongData(
	{ trackName, artists, uniId, duration },
	token,
	user
) {
	// Raw results directly from song and artist search by query
	const searchValue = `${trackName} ${artists}`;
	const rawResults = await searchForTrack({ searchValue, token, user });
	if (!rawResults) return '-1';

	// Attempt to find a song match by isrc
	songMatchTesting(rawResults, trackName, artists, uniId, duration);
	let songMatch = rawResults.tracks.items.find(
		(song) =>
			song.external_ids.isrc === uniId ||
			(song.external_ids.isrc.substring(0, 7) === uniId.substring(0, 7) &&
				song.duration_ms + 500 >= duration &&
				song.duration_ms - 500 <= duration)
	);
	// If found return the songs id
	if (!songMatch) {
		console.log('No song match');
	}
	songMatch = songMatch ? songMatch : { uri: '-1' };
	return songMatch.uri;
}

// Perfoms a track search on spotify by query
async function searchForTrack(params) {
	const { searchValue, token } = params;
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
		const refreshTokenError = err.response.status === UNAUTHORIZED_ERROR_CODE;
		if (refreshTokenError) {
			return await handleTempToken(params, searchForTrack);
		}
	}
}

// Search for an album using apple data and return all the uri's if found
async function getAlbumId(
	{ albumName, artists, releaseDate, songCount },
	uniAlbumNameFormatter,
	token,
	user
) {
	// Raw results directly from album search by query
	console.log(albumName, artists);
	const searchValue = `${albumName} ${artists}`;
	const rawResults = await searchForAlbum({ searchValue, token, user });
	if (!rawResults) return rawResults;

	albumMatchTesting(
		rawResults,
		albumName,
		releaseDate,
		songCount,
		uniAlbumNameFormatter
	);
	// Attempt to find an album match by name
	//Song count must always match and either the name must match or the release date

	const albumMatch = rawResults.albums.items.find(
		(album) =>
			songCount === album.total_tracks &&
			(uniAlbumNameFormatter(album.name, true) ===
				uniAlbumNameFormatter(albumName, true) ||
				album.release_date === releaseDate)
	);
	if (albumMatch) {
		console.log('Match Album!');
		return albumMatch.id;
	}
	console.log('album match not found');
	return albumMatch;
}

// Perfoms an album search on spotify by query
async function searchForAlbum(params) {
	const { searchValue, token } = params;
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
		const refreshTokenError = err.response.status === UNAUTHORIZED_ERROR_CODE;
		if (refreshTokenError) {
			return await handleTempToken(params, searchForAlbum);
		}
	}
}

// Format song data for spotify player
function formatSongData(songData) {
	return songData.uri;
}
//For Testing Purposes: Console.logs our match results for cross search
function songMatchTesting(rawResults, trackName, artists, uniId, duration) {
	console.log(trackName, artists);
	rawResults.tracks.items.every((song) => {
		console.log(
			'Test 1: ',

			song.external_ids.isrc === uniId,
			song.external_ids.isrc,
			uniId
		);
		console.log(
			'Test 2: ',
			song.duration_ms + 500 >= duration && song.duration_ms - 500 <= duration,
			duration,
			song.duration_ms
		);
		if (
			song.external_ids.isrc === uniId ||
			(song.external_ids.isrc.substring(0, 7) === uniId.substring(0, 7) &&
				song.duration_ms + 500 >= duration &&
				song.duration_ms - 500 <= duration)
		) {
			console.log('Match!');
			return false;
		}
		return true;
	});
}

function albumMatchTesting(
	rawResults,
	albumName,
	releaseDate,
	songCount,
	uniAlbumNameFormatter
) {
	rawResults.albums.items.every((album) => {
		console.log(
			'Test 1: ',
			songCount === album.total_tracks,
			songCount,
			album.total_tracks
		);
		console.log('-------------------------');
		console.log(
			'Test 2: ',
			uniAlbumNameFormatter(album.name, true) ===
				uniAlbumNameFormatter(albumName, true),
			uniAlbumNameFormatter(album.name, true),
			uniAlbumNameFormatter(albumName, true)
		);
		console.log(
			'Release Date: ',
			album.release_date === releaseDate,
			album.release_date,
			releaseDate
		);
		if (
			songCount === album.total_tracks &&
			(album.name.toLowerCase() === albumName ||
				album.release_date === releaseDate)
		) {
			return false;
		}
		return true;
	});
}

// When this is called we already have the albums id
// Just grab the album directly by id and pull out the data for all songs in the album
async function formatAlbumData(albumData, token, formatDuration, user) {
	const username = user.username;
	const results = await getAlbumById({ albumId: albumData.id, token, user });

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
			addedBy: username,
			duration: track.duration_ms,
			formattedDuration: formatDuration(track.duration_ms),
		});
	});

	// Return data required by spotify's player and data used by ui
	return { dataForSpotifyPlayer, dataForUi };
}

// Get album directly by id
async function getAlbumById(params) {
	const { albumId, token } = params;
	const endPoint = `	https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`;
	try {
		const res = await axios.get(endPoint, defaultHeader(token));
		return res.data;
	} catch (err) {
		const refreshTokenError = err.response.status === UNAUTHORIZED_ERROR_CODE;
		if (refreshTokenError) {
			return await handleTempToken(params, getAlbumById);
		}
	}
}

async function getTempToken() {
	try {
		const url =
			process.env.NODE_ENV === 'production'
				? 'www.listeninglobby.com/spotify/temp_token'
				: 'http://localhost:8888/spotify/temp_token';
		const res = await axios.get(url);
		return res.data;
	} catch (err) {}
}
function compareSongsInAlbumByDuration({ items }, dataForApple) {
	let spotifyDuration = 0;
	let appleDuration = 0;
	let songCount = 0;

	items.forEach((track) => {
		spotifyDuration += track.duration_ms;
		songCount++;
	});
	const threshold = songCount * 1250;
	dataForApple.forEach((track) => {
		appleDuration += track.duration;
	});

	console.log(spotifyDuration, appleDuration);
	return (
		spotifyDuration >= appleDuration - threshold &&
		spotifyDuration <= appleDuration + threshold
	);
}

async function getAlbumSongsUriByAlbumId(albumId, token, dataForApple) {
	// If we find a match get the album directly by id
	const spotifyAlbumSongData = await getAlbumById({ albumId, token });
	// Return all uris for songs in album
	if (compareSongsInAlbumByDuration(spotifyAlbumSongData, dataForApple)) {
		return spotifyAlbumSongData.items.map((track) => track.uri);
	} else {
		return undefined;
	}
}

async function likeSong({ spotifySong, user }) {
	const songId = spotifySong.replace('spotify:track:', '');
	const endPoint = `https://api.spotify.com/v1/me/tracks?ids=${songId}`;

	try {
		await axios.put(endPoint, {}, defaultHeader(user.token));
	} catch (err) {
		console.log(err);
	}
}

async function getNewToken(refreshToken) {
	const config = {
		params: {
			refresh_token: refreshToken,
		},
	};

	try {
		const res = await axios.get('/spotify/refresh_token', config);
		return res.data;
	} catch (err) {}
}

// Token Error Handlers
async function handleRefreshToken(params, func) {
	console.log('------------------ REFRESH TOKEN RAN -----------------------');
	// Get new token
	const newToken = await getNewToken(params.refreshToken);
	params.token = newToken;
	lobby.setUsersToken(params.user.lobby_id, params.user.user_id, newToken);

	// Call the same function that threw the auth error but now use the new token
	const results = await func(params);
	return results;
}

async function handleTempToken(params, func) {
	console.log('------------------ TEMP TOKEN RAN -----------------------');
	// Get new token
	const newToken = await getTempToken();
	params.token = newToken;
	lobby.setTempToken(params.user.lobby_id, newToken);

	// Call the same function that threw the auth error but now use the new token
	const results = await func(params);
	return results;
}

async function getAlbumTracks(albumId, user) {
	const results = await getAlbumById({
		albumId,
		token: user.token,
		user,
	});
	return results.items;
}

async function getIsrc({ songData, user }) {
	const track = await getTrackById({
		songId: songData.id,
		token: user.token,
		user,
		refreshToken: user.refreshToken,
	});
	return track.external_ids.isrc;
}

async function getTrackById(params) {
	const { songId, token } = params;
	const endPoint = `https://api.spotify.com/v1/tracks/${songId}`;

	try {
		const res = await axios.get(endPoint, defaultHeader(token));
		res.data.refreshOccured = false;
		return res.data;
	} catch (err) {
		const refreshTokenError = err.response.status === UNAUTHORIZED_ERROR_CODE;
		if (refreshTokenError) {
			return await handleRefreshToken(params, getTrackById);
		}
	}
}

module.exports = {
	likeSong,
	search,
	formatSongData,
	getAndFormatSongData,
	formatAlbumData,
	getTempToken,
	getAlbumId,
	getAlbumSongsUriByAlbumId,
	getAlbumTracks,
	getAlbumById,
	getIsrc,
};
