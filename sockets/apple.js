const axios = require('axios');
let defaultSearchResults = {
	songs: {
		data: [],
	},
	albums: {
		data: [],
	},
};
let serachResults;

async function search(searchName, token) {
	const endPoint = `https://api.music.apple.com/v1/catalog/us/search?term=${searchName}&limit=5&types=songs,albums`;
	const config = {
		headers: {
			Authorization: 'Bearer ' + token,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		serachResults =
			res.data.meta.results.order.length > 0
				? res.data.results
				: defaultSearchResults;
		return serachResults;
	} catch (err) {
		console.log(err);
		return defaultSearchResults;
	}
}

async function getAndFormatSongData(song, token) {
	const { trackName, artists, uniId } = song;
	const searchResult = await search(`${trackName} ${artists}`, token);
	let result = searchResult.songs.data.find(
		(song) => song.attributes.isrc.substring(0, 8) === uniId.substring(0, 8)
	);
	result = result === undefined ? '' : result;
	return result.id;
}

//Searching from Spotify
async function getAlbumId(albumData, token) {
	const searchResults = await appleAlbumSearch(albumData.albumName, token);

	let result = searchResults.find(
		({ attributes }) =>
			attributes.name === albumData.albumName ||
			attributes.releaseDate === albumData.releaseDate
	);
	result = result === undefined ? { id: '' } : result;
	return result.id;
}

async function appleAlbumSearch(albumName, token) {
	const endPoint = `https://api.music.apple.com/v1/catalog/us/search?term=${albumName}&limit=10&types=albums`;
	const config = {
		headers: {
			Authorization: 'Bearer ' + token,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data.results.albums.data;
	} catch (err) {
		console.log(err.response.status, err.response.statusText);
		return [];
	}
}

async function getAlbumSongsIdByAlbumId(appleAlbumId, appleToken) {
	const allAlbumSongData = await getAlbumSongsData(appleAlbumId, appleToken);
	return allAlbumSongData.map((track) => track.id);
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

// TODO id
async function formatAlbumData(albumData, appleToken) {
	const allAlbumSongData = await getAlbumSongsData(albumData.id, appleToken);

	let dataForApplePlayer = [];
	let dataForUi = [];

	allAlbumSongData.forEach((track) => {
		dataForApplePlayer.push(track.id);

		dataForUi.push({
			trackName: track.attributes.name,
			artists: track.attributes.artistName,
			trackCover: albumData.albumCover,
			id: track.id,
		});
	});

	return { dataForApplePlayer, dataForUi };
}

async function getTempToken() {
	const endPoint = 'http://localhost:8888/apple/token';

	try {
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
};
exports = module.exports;
