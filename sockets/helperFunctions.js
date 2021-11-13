const appleFunctions = require('./appleFunctions');
const spotifyFunctions = require('./spotifyFunctions');
const {
	appleSearchAndFormat,
	formatSongForApple,
	formatAlbumForApple,
	appleAlbumSearchAndFormat,
} = appleFunctions;
const {
	formatSongForSpotify,
	formatAlbumForSpotify,
	spotfiySearchAndFormat,
	spotifyAlbumSearchAndFormat,
} = spotifyFunctions;

function formatSearchResults(searchResults, music_provider) {
	let necessaryTrackInfo = [];
	let necessaryAlbumInfo = [];

	if (music_provider === 'spotify') {
		const albums = searchResults.albums.items;
		const tracks = searchResults.tracks.items;

		necessaryTrackInfo = tracks.map((track) => {
			return {
				trackName: track.name,
				artists: track.artists.map(({ name }) => name).join(', '),
				trackCover: track.album.images[0].url,
				id: track.id,
				uniId: track.external_ids.isrc,
			};
		});

		necessaryAlbumInfo = albums.map((album) => {
			return {
				albumName: album.name,
				artists: album.artists.map(({ name }) => name).join(', '),
				albumCover: album.images[0].url,
				id: album.id,
				songCount: album.total_tracks,
				releaseDate: album.release_date,
			};
		});
	} else {
		if (searchResults.songs) {
			const tracks = searchResults.songs.data;
			necessaryTrackInfo = tracks.map((track) => {
				return {
					href: track.href,
					type: track.type,
					trackName: formatSearhQueryForApple(track.attributes.name),
					artists: formatSearhQueryForApple(
						track.attributes.artistName
					),
					trackCover: track.attributes.artwork.url.replace(
						'{w}x{h}',
						'640x640'
					),
					id: track.id,
					uniId: track.attributes.isrc,
				};
			});
		}
		if (searchResults.albums) {
			const albums = searchResults.albums.data;
			necessaryAlbumInfo = albums.map((album) => {
				return {
					href: album.href,
					type: album.type,
					albumName: formatSearhQueryForApple(album.attributes.name),
					artists: formatSearhQueryForApple(
						album.attributes.artistName
					),
					albumCover: album.attributes.artwork.url.replace(
						'{w}x{h}',
						'640x640'
					),
					id: album.id,
					songCount: album.attributes.trackCount,
					releaseDate: album.attributes.releaseDate,
				};
			});
		}
	}

	return { tracks: necessaryTrackInfo, albums: necessaryAlbumInfo };
}

async function performDesignatedSongSearches(players, user, song) {
	const applePlayerCount = players.apple.count;
	const spotifyPlayerCount = players.spotify.count;

	const appleToken = players.apple.token;
	const spotifyToken = players.spotify.token;

	let spotifySong;
	let appleSong;

	if (applePlayerCount > 0 && spotifyPlayerCount > 0) {
		if (user.music_provider === 'spotify') {
			spotifySong = formatSongForSpotify(song);
			appleSong = await appleSearchAndFormat(song, appleToken);
		} else {
			spotifySong = await spotfiySearchAndFormat(song, spotifyToken);
			appleSong = formatSongForApple(song);
		}
	} else if (spotifyPlayerCount > 0) {
		spotifySong = formatSongForSpotify(song);
	} else {
		appleSong = formatSongForApple(song);
	}

	return { spotifySong, appleSong };
}

async function performDesignatedAlbumSearches(players, user, album) {
	const applePlayerCount = players.apple.count;
	const spotifyPlayerCount = players.spotify.count;

	const appleToken = players.apple.token;
	const spotifyToken = players.spotify.token;

	let spotifyAlbum;
	let appleAlbum;
	let allTracksDisplay;

	if (applePlayerCount > 0 && spotifyPlayerCount > 0) {
		if (user.music_provider === 'spotify') {
			const results = await formatAlbumForSpotify(
				album,
				spotifyToken
			);
			spotifyAlbum = results.spotifyAlbum;
			allTracksDisplay = results.spotifyAlbumDisplay;
			appleAlbum = await appleAlbumSearchAndFormat(album, appleToken);
		} else {
			const results = await formatAlbumForApple(album, appleToken);
			appleAlbum = results.appleAlbum;
			allTracksDisplay = results.appleAlbumDisplay;

			spotifyAlbum = await spotifyAlbumSearchAndFormat(
				album,
				spotifyToken
			);
		}
	} else if (spotifyPlayerCount > 0) {
		const results = await formatAlbumForSpotify(album, spotifyToken);
		spotifyAlbum = results.spotifyAlbum;
		allTracksDisplay = results.spotifyAlbumDisplay;
	} else {
		const results = await formatAlbumForApple(album, appleToken);
		appleAlbum = results.appleAlbum;
		allTracksDisplay = results.appleAlbumDisplay;
	}

	return {
		spotifyAlbum,
		appleAlbum,
		allTracksDisplay,
	};
}
function replaceAll(target, search, replacement) {
	return target.replace(new RegExp(search, 'g'), replacement);
}

function formatSearhQueryForApple(query) {
	query = replaceAll(query, '&', 'and');
	query = replaceAll(query, 'with', 'feat');
	query = replaceAll(query, '’', '');
	return query;
}

module.exports = {
	formatSearchResults,
	performDesignatedSongSearches,
	performDesignatedAlbumSearches,
	formatSearhQueryForApple,
};
exports = module.exports;
