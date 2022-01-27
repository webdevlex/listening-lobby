const axios = require('axios');

let defaultSearchResults = {
	songs: {
		data: [],
	},
	albums: {
		data: [],
	},
};

async function search(searchName, token, searchAmount = 10) {
	const LIMIT = searchAmount;
	const endPoint = `https://api.music.apple.com/v1/catalog/us/search?term=${searchName}&limit=${LIMIT}&types=songs,albums`;
	const config = {
		headers: {
			Authorization: 'Bearer ' + token,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		let searchResults =
			res.data.meta.results.order.length > 0
				? res.data.results
				: defaultSearchResults;
		!searchResults.albums ? (searchResults.albums = { data: [] }) : null;
		!searchResults.songs ? (searchResults.songs = { data: [] }) : null;

		return searchResults;
	} catch (err) {
		return defaultSearchResults;
	}
}

function songMatchTesting(rawResults, trackName, artists, uniId, duration) {
	console.log(trackName, artists);
	rawResults.songs.data.every((song) => {
		console.log(
			'Test 1: ',

			song.attributes.isrc === uniId,
			song.attributes.isrc,
			uniId
		);
		console.log(
			'Test 2: ',
			song.attributes.durationInMillis + 500 >= duration &&
				song.attributes.durationInMillis - 500 <= duration,
			duration,
			song.attributes.durationInMillis
		);
		if (
			song.attributes.isrc === uniId ||
			(song.attributes.isrc.substring(0, 7) === uniId.substring(0, 7) &&
				song.attributes.durationInMillis + 500 >= duration &&
				song.attributes.durationInMillis - 500 <= duration)
		) {
			console.log('Match!');
			return false;
		}
		return true;
	});
}

async function getAndFormatSongData(
	{ trackName, artists, duration, uniId },
	token
) {
	const searchResult = await search(`${trackName} ${artists}`, token, 10);
	if (!searchResult) return '-1';

	songMatchTesting(searchResult, trackName, artists, uniId, duration);
	let songMatch = searchResult.songs.data.find(
		(song) =>
			song.attributes.isrc === uniId ||
			(song.attributes.isrc.substring(0, 7) === uniId.substring(0, 7) &&
				song.attributes.durationInMillis + 500 >= duration &&
				song.attributes.durationInMillis - 500 <= duration)
	);
	if (!songMatch) {
		console.log('No song match');
	}
	songMatch = songMatch ? songMatch : { id: '-1' };
	return songMatch.id;
}
function albumMatchTesting(
	rawResults,
	albumName,
	releaseDate,
	songCount,
	uniAlbumNameFormatter
) {
	rawResults.every(({ attributes }) => {
		console.log(
			'Test 1: ',
			songCount === attributes.trackCount,
			songCount,
			attributes.trackCount
		);
		console.log('-------------------------');
		console.log(
			'Test 2: ',
			uniAlbumNameFormatter(attributes.name, true) ===
				uniAlbumNameFormatter(albumName, true),
			uniAlbumNameFormatter(attributes.name, true),
			uniAlbumNameFormatter(albumName, true)
		);
		console.log(
			'Release Date: ',
			attributes.releaseDate === releaseDate,
			attributes.releaseDate,
			releaseDate
		);
		if (
			songCount === attributes.trackCount &&
			(uniAlbumNameFormatter(attributes.name) === albumName ||
				attributes.releaseDate === releaseDate)
		) {
			return false;
		}
		return true;
	});
}

async function removeMusicVideosFromCount(album, token, spotifySongCount) {
	let allAlbumTracks = await getAlbumSongsData(album.id, token);
	let newSongData = [];
	allAlbumTracks.forEach((track) => {
		if (track.type === 'songs') {
			newSongData.push(track);
		}
	});
	if (newSongData.length === spotifySongCount) {
		newSongData.push(1);
		return newSongData;
	}
}
//Searching from Spotify
async function getAlbumId(
	{ albumName, artists, releaseDate, songCount },
	uniAlbumNameFormatter,
	token,
	spotifyData
) {
	const searchResults = await appleAlbumSearch(
		`${albumName} ${artists}`,
		token
	);
	if (!searchResults) return searchResults;
	albumMatchTesting(
		searchResults,
		albumName,
		releaseDate,
		songCount,
		uniAlbumNameFormatter
	);

	let albumMatch;
	for (let i = 0; i < searchResults.length; ++i) {
		if (
			uniAlbumNameFormatter(searchResults[i].attributes.name, true) ===
				uniAlbumNameFormatter(albumName, true) ||
			searchResults[i].attributes.releaseDate === releaseDate
		) {
			if (songCount === searchResults[i].attributes.trackCount) {
				albumMatch = searchResults[i];
			} else {
				albumMatch = await removeMusicVideosFromCount(
					searchResults[i],
					token,
					songCount,
					spotifyData
				);
			}
			if (albumMatch) break;
		}
	}

	if (albumMatch) {
		if (albumMatch[albumMatch.length - 1] === 1) {
			return albumMatch;
		}
		console.log('Match!');
		return albumMatch.id;
	} else {
		console.log('No Match');
		return albumMatch;
	}
}

async function appleAlbumSearch(searchValue, token) {
	const endPoint = `https://api.music.apple.com/v1/catalog/us/search?term=${searchValue}&limit=10&types=albums`;
	const config = {
		headers: {
			Authorization: 'Bearer ' + token,
		},
	};

	try {
		const res = await axios.get(endPoint, config);

		return res.data.results.albums.data;
	} catch (err) {}
}
function compareSongsInAlbumByDuration(dataForApple, dataForSpotify) {
	let appleDuration = 0;
	let spotifyDuration = 0;
	let songCount = 0;

	dataForApple.forEach((track) => {
		appleDuration += track.attributes.durationInMillis;
		songCount++;
	});
	const threshold = songCount * 1250;
	dataForSpotify.forEach((track) => {
		spotifyDuration += track.duration;
	});
	console.log(appleDuration, spotifyDuration);
	return (
		appleDuration >= spotifyDuration - threshold &&
		appleDuration <= spotifyDuration + threshold
	);
}

async function getAlbumSongsIdByAlbumId(
	appleAlbumId,
	appleToken,
	dataForSpotify
) {
	let allAlbumSongData;
	if (appleAlbumId[appleAlbumId.length - 1] === 1) {
		appleAlbumId.pop();
		allAlbumSongData = appleAlbumId;
	} else {
		allAlbumSongData = await getAlbumSongsData(appleAlbumId, appleToken);
	}

	if (compareSongsInAlbumByDuration(allAlbumSongData, dataForSpotify)) {
		return allAlbumSongData.map((track) => track.id);
	} else {
		return undefined;
	}
}

async function getAlbumSongsData(id, token) {
	const endPoint = `https://api.music.apple.com/v1/catalog/us/albums/${id}/tracks`;
	const config = {
		headers: {
			Authorization: 'Bearer ' + token,
		},
	};
	try {
		const res = await axios.get(endPoint, config);
		return res.data.data;
	} catch (err) {
		console.log(err);
	}
}

function formatSongData({ id }) {
	return id;
}

async function formatAlbumData(
	albumData,
	appleToken,
	formatDuration,
	{ username }
) {
	const allAlbumSongData = await getAlbumSongsData(albumData.id, appleToken);

	let dataForApplePlayer = [];
	let dataForUi = [];

	allAlbumSongData.forEach((track) => {
		if (track.type === 'songs') {
			dataForApplePlayer.push(track.id);
			dataForUi.push({
				trackName: track.attributes.name,
				artists: track.attributes.artistName,
				trackCover: albumData.albumCover,
				id: track.id,
				addedBy: username,
				formattedDuration: formatDuration(track.attributes.durationInMillis),
				duration: track.attributes.durationInMillis,
			});
		} else {
			--albumData.songCount;
		}
	});

	return { dataForApplePlayer, dataForUi };
}

async function getTempToken() {
	try {
		const endPoint =
			process.env.NODE_ENV === 'production'
				? 'www.listeninglobby.com/apple/token'
				: 'http://localhost:8888/apple/token';
		const res = await axios.get(endPoint);

		return res.data.token;
	} catch (err) {
		// TODO
	}
}

module.exports = {
	search,
	getAndFormatSongData,
	formatSongData,
	formatAlbumData,
	getAlbumId,
	getTempToken,
	getAlbumSongsIdByAlbumId,
	getAlbumSongsData,
};
