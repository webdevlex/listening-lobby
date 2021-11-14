const apple = require('./apple');
const spotify = require('./spotify');

function formatSearchResults(searchResults, { user }) {
	let necessaryTrackInfo = [];
	let necessaryAlbumInfo = [];

	if (user.music_provider === 'spotify') {
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
					trackName: appleFormatSearchQuery(track.attributes.name),
					artists: appleFormatSearchQuery(track.attributes.artistName),
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
					albumName: appleFormatSearchQuery(album.attributes.name),
					artists: appleFormatSearchQuery(album.attributes.artistName),
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

async function uniSearch({ searchValue, user }) {
	const { music_provider, token } = user;
	if (music_provider === 'spotify') {
		return await spotify.search(searchValue, token);
	} else {
		searchValue = appleFormatSearchQuery(searchValue);
		return await apple.search(searchValue, token);
	}
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
			spotifySong = spotify.formatSong(song);
			appleSong = await apple.songSearchAndFormat(song, appleToken);
		} else {
			spotifySong = await spotify.searchAndFormat(song, spotifyToken);
			appleSong = apple.formatSong(song);
		}
	} else if (spotifyPlayerCount > 0) {
		spotifySong = spotify.formatSong(song);
	} else {
		appleSong = apple.formatSong(song);
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
			const results = await spotify.formatAlbum(album, spotifyToken);
			spotifyAlbum = results.spotifyAlbum;
			allTracksDisplay = results.spotifyAlbumDisplay;
			appleAlbum = await apple.albumSearchAndFormat(album, appleToken);
		} else {
			const results = await apple.formatAlbum(album, appleToken);
			appleAlbum = results.appleAlbum;
			allTracksDisplay = results.appleAlbumDisplay;

			spotifyAlbum = await spotify.albumSearchAndFormat(album, spotifyToken);
		}
	} else if (spotifyPlayerCount > 0) {
		const results = await spotify.formatAlbum(album, spotifyToken);
		spotifyAlbum = results.spotifyAlbum;
		allTracksDisplay = results.spotifyAlbumDisplay;
	} else {
		const results = await apple.formatAlbum(album, appleToken);
		appleAlbum = results.appleAlbum;
		allTracksDisplay = results.appleAlbumDisplay;
	}

	return {
		spotifyAlbum,
		appleAlbum,
		allTracksDisplay,
	};
}

function appleFormatSearchQuery(query) {
	query = replaceAll(query, '&', 'and');
	query = replaceAll(query, 'with', 'feat');
	query = replaceAll(query, '’', '');
	return query;
}

function replaceAll(target, search, replacement) {
	return target.replace(new RegExp(search, 'g'), replacement);
}

module.exports = {
	formatSearchResults,
	performDesignatedSongSearches,
	performDesignatedAlbumSearches,
	uniSearch,
};
exports = module.exports;
