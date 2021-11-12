const axios = require('axios');
function formatQuery(query) {
	query = query.replaceAll('&', 'and');
	query = query.replaceAll('with', 'feat');
	query = query.replaceAll('’', '');
	return query;
}

async function appleSearch(query, token) {
	let defaultValue = {
		songs: {
			data: [],
		},
		albums: {
			data: [],
		},
	};
	let searchResults;
	query = formatQuery(query);
	console.log(query);

	await axios
		.get(
			'https://api.music.apple.com/v1/catalog/us/search?term=' +
				query +
				'&limit=5&types=songs,albums',
			{
				headers: {
					Authorization: 'Bearer ' + token,
				},
			}
		)
		.then((response) => {
			if (response.data.meta.results.order.length > 0) {
				searchResults = response.data.results;
			} else {
				searchResults = defaultValue;
			}
		})
		.catch((error) => {
			searchResults = defaultValue;
		});
	return searchResults;
}

async function appleSearchAndFormat(song, token) {
	const { trackName, artists, uniId } = song;
	const searchResult = await appleSearch(
		`${trackName} ${artists}`,
		token
	);
	//Temp loop to check each isrc vs uniId
	searchResult.songs.data.forEach((song) => {
		console.log(song.attributes.isrc + ' ' + uniId);
	});
	const result = searchResult.songs.data.find(
		(song) =>
			song.attributes.isrc.substring(0, 8) === uniId.substring(0, 8)
	);

	if (!result) {
		//Temp catch error
		console.log('error');
		return { href: '', type: '', id: '' };
	}
	const { href, type, id } = result;
	return { href, type, id };
}

async function appleAlbumSearchAndFormat(album, token) {
	const searchRestuls = await appleAlbumSearch(album, token);
	const result = searchRestuls.find(
		({ attributes }) => attributes.name === album.albumName
	);
	return { id: result.id, type: result.type, href: result.href };
}

async function appleAlbumSearch(album, token) {
	const endPoint = `https://api.music.apple.com/v1/catalog/us/search?term=${album.albumName}&limit=10&types=albums`;
	const config = {
		headers: {
			Authorization: 'Bearer ' + token,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data.results.albums.data;
	} catch (err) {
		console.log(err);
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
			artists: track.artistName,
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
