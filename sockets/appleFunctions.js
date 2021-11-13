const axios = require('axios');
let searchResults = {
	songs: {
		data: [],
	},
	albums: {
		data: [],
	},
};

async function appleSearch(searchName, token) {
	const endPoint = `https://api.music.apple.com/v1/catalog/us/search?term=${searchName}&limit=5&types=songs,albums`;
	const config = {
		headers: {
			Authorization: 'Bearer ' + token,
		},
	};
	try {
		const res = await axios.get(endPoint, config);
		res.data.meta.results.order.length > 0
			? (searchResults = res.data.results)
			: searchResults;
		return searchResults;
	} catch (err) {
		console.log(err.response.status + ' ' + err.response.statusText);
		return searchResults;
	}
}

async function appleSearchAndFormat(song, token) {
	const { trackName, artists, uniId } = song;
	const searchResult = await appleSearch(
		`${trackName} ${artists}`,
		token
	);
	const result = searchResult.songs.data.find(
		(song) =>
			song.attributes.isrc.substring(0, 8) === uniId.substring(0, 8)
	);
	result === undefined
		? (result = { href: '', type: '', id: '' })
		: result;
	return { href: result.href, type: result.type, id: result.id };
}

//Searching from Spotify
async function appleAlbumSearchAndFormat(album, token) {
	const searchResults = await appleAlbumSearch(album, token);
	let result = searchResults.find(
		({ attributes }) =>
			attributes.name === album.albumName ||
			attributes.releaseDate === album.releaseDate
	);
	result === undefined
		? (result = { href: '', type: '', id: '' })
		: result;
	return { href: result.href, type: result.type, id: result.id };
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
		console.log(err.response.status + ' ' + err.response.statusText);
		return [];
	}
}

function formatSongForApple({ href, type, id }) {
	return { href, type, id };
}

async function formatAlbumForApple(album, token) {
	const tracks = await getAlbumTracks(album, token);
	let appleAlbum = {
		id: album.id,
		type: album.type,
		href: album.href,
	};
	let appleAlbumDisplay = [];

	tracks.forEach((track) => {
		appleAlbumDisplay.push({
			trackName: track.attributes.name,
			artists: track.attributes.artistName,
			trackCover: album.albumCover,
			id: track.id,
			type: track.type,
			href: track.href,
		});
	});

	return { appleAlbum, appleAlbumDisplay };
}

async function getAlbumTracks(album, token) {
	const endPoint = `https://api.music.apple.com/v1/catalog/us/albums/${album.id}/tracks`;
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

module.exports = {
	appleSearch,
	appleSearchAndFormat,
	formatSongForApple,
	formatAlbumForApple,
	appleAlbumSearchAndFormat,
};
exports = module.exports;
