const apple = require('./apple');
const spotify = require('./spotify');
const formatter = require('./formatter');
const moment = require('moment');

// Perform search for music provider that the user is using
async function uniSearch({ searchValue, user }, searchAmount = 10) {
	const token = user.token;
	const refreshToken = user.refresh_token;

	// If the user is using spotify player perform spotify search
	if (user.music_provider === 'spotify') {
		return await spotify.search({
			searchValue,
			token,
			refreshToken,
			user,
			searchAmount,
		});
	}
	// If the user is using apple player format their query then perform spotify search
	else {
		searchValue = formatter.appleFormatSearchQuery(searchValue);
		return await apple.search(searchValue, token, searchAmount);
	}
}

//  use users music provider to searches for songs and albums and return formatted results
function formatUniSearchResults(searchResults, { user }) {
	// Formatted search results
	let tracks = [];
	let albums = [];

	// If user is using spotify format search results for spotify
	if (user.music_provider === 'spotify') {
		tracks = extractSpotifySongData(searchResults);
		albums = extractSpotifyAlbumData(searchResults);
		// If user is using apple format search results for apple
	} else {
		tracks = extractAppleSongData(searchResults);
		albums = extractAppleAlbumData(searchResults);
	}

	// Return formatted search results
	return { tracks, albums };
}

// Pull out necessary song information from all spotify search results
function extractSpotifySongData(searchResults) {
	if (!searchResults) return [];
	const tracks = searchResults.tracks.items;
	return tracks.map((track) => {
		return {
			trackName: track.name,
			artists: track.artists.map(({ name }) => name).join(', '),
			trackCover: track.album.images[0].url,
			id: track.id,
			uri: track.uri,
			uniId: track.external_ids.isrc,
			duration: track.duration_ms,
			formattedDuration: formatDuration(track.duration_ms),
		};
	});
}

// Pull out necessary album information from all spotify search results
function extractSpotifyAlbumData(searchResults) {
	if (!searchResults) return [];
	const albums = searchResults.albums.items;
	return albums.map((album) => {
		return {
			albumName: album.name,
			artists: album.artists.map(({ name }) => name).join(', '),
			albumCover: album.images[0].url,
			id: album.id,
			songCount: album.total_tracks,
			releaseDate: album.release_date,
		};
	});
}

// Pull out necessary song information from all apple search results
function extractAppleSongData(searchResults) {
	// If there are search results for songs

	const tracks = searchResults.songs.data;
	return tracks.map((track) => {
		return {
			href: track.href,
			type: track.type,
			trackName: formatter.appleFormatSearchQuery(track.attributes.name),
			artists: formatter.uniFormatArtistsForUi(track.attributes.artistName),
			trackCover: track.attributes.artwork.url.replace('{w}x{h}', '640x640'),
			id: track.id,
			uniId: track.attributes.isrc,
			duration: track.attributes.durationInMillis,
			formattedDuration: formatDuration(track.attributes.durationInMillis),
		};
	});
}

// Pull out necessary album information from all apple search results
function extractAppleAlbumData(searchResults) {
	// If there are search resutls for album
	// if (!searchResults.albums) return [];
	const albums = searchResults.albums.data;
	return albums.map((album) => {
		return {
			href: album.href,
			type: album.type,
			albumName: formatter.appleFormatSearchQuery(album.attributes.name),
			artists: formatter.uniFormatArtistsForUi(album.attributes.artistName),
			albumCover: album.attributes.artwork.url.replace('{w}x{h}', '640x640'),
			id: album.id,
			songCount: album.attributes.trackCount,
			releaseDate: album.attributes.releaseDate,
		};
	});
}

// Retrieves necessary song data for the active players in lobby
async function getSongDataForPlayers(tokens, { songData, user }) {
	// Tokens that will be used if a search is required
	const spotifyToken = tokens.spotify;
	const appleToken = tokens.apple;

	// The data that will be returned to the players
	let dataForSpotifyPlayer;
	let dataForApplePlayer;

	let tempTrackName = songData.trackName;
	let tempArtistName = songData.artists;
	songData.trackName = formatter.uniTrackFormatter(songData.trackName);
	songData.artists = formatter.uniArtistsFormatter(songData.artists);

	// If the user that made the request is using spotify
	if (user.music_provider === 'spotify') {
		// We already have spotify data just format it
		dataForSpotifyPlayer = spotify.formatSongData(songData);

		// We do not have apple data so search for it then format it
		// Must first format search query for api call
		dataForApplePlayer = await apple.getAndFormatSongData(songData, appleToken);
	}
	// If the user that made the request is using apple
	else {
		// We do not have spotify data so search for it then format it
		dataForSpotifyPlayer = await spotify.getAndFormatSongData(
			songData,
			spotifyToken,
			user
		);

		// We already have apple data so just format it
		dataForApplePlayer = apple.formatSongData(songData);
	}
	songData.trackName = tempTrackName;
	songData.artists = tempArtistName;
	return { dataForSpotifyPlayer, dataForApplePlayer, dataForUi: songData };
}

// Retrieves necessary album data for the active players in lobby
async function uniAlbumSearch(tokens, { albumData, user }) {
	// Tokens that will be used if a search is required
	const spotifyToken = tokens.spotify;
	const appleToken = tokens.apple;

	// The data that will be returned to the players
	let dataForSpotifyPlayer;
	let dataForApplePlayer;
	let dataForUi;

	albumData.albumName = formatter.uniAlbumNameFormatter(albumData.albumName);
	albumData.artists = formatter.uniAlbumArtistsFormatter(albumData.artists);

	if (user.music_provider === 'spotify') {
		// We already have spotify album id just request the album with the id and grab all song data
		dataForSpotifyPlayerAndUi = await spotify.formatAlbumData(
			albumData,
			spotifyToken,
			formatDuration,
			user
		);
		dataForSpotifyPlayer = dataForSpotifyPlayerAndUi.dataForSpotifyPlayer;
		dataForUi = dataForSpotifyPlayerAndUi.dataForUi;

		// We do not have apple data so search for it then format it
		// Must first format search query for api call

		const appleAlbumId = await apple.getAlbumId(
			albumData,
			formatter.uniAlbumNameFormatter,
			appleToken
		);
		if (appleAlbumId) {
			dataForApplePlayer = await apple.getAlbumSongsIdByAlbumId(
				appleAlbumId,
				appleToken,
				dataForUi
			);
		}
	} else {
		// We already have apple album id just request the album with the id and grab all song data
		dataForApplePlayerAndUi = await apple.formatAlbumData(
			albumData,
			appleToken,
			formatDuration,
			user
		);

		dataForApplePlayer = dataForApplePlayerAndUi.dataForApplePlayer;
		dataForUi = dataForApplePlayerAndUi.dataForUi;

		const spotifyAlbumId = await spotify.getAlbumId(
			albumData,
			formatter.uniAlbumNameFormatter,
			spotifyToken,
			user
		);
		if (spotifyAlbumId) {
			dataForSpotifyPlayer = await spotify.getAlbumSongsUriByAlbumId(
				spotifyAlbumId,
				spotifyToken,
				dataForUi
			);
		}
	}

	return { dataForSpotifyPlayer, dataForApplePlayer, dataForUi };
}

async function getMissingProviderToken(musicProvider) {
	return musicProvider === 'spotify'
		? await apple.getTempToken()
		: await spotify.getTempToken();
}

function likeSong(data) {
	spotify.likeSong(data);
}

function formatDuration(millis) {
	var minutes = Math.floor(millis / 60000);
	var seconds = ((millis % 60000) / 1000).toFixed(0);
	return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

// Format a message to be sent back to the front end
function formatMessage(username, message) {
	return {
		username: username,
		message: message,
		time: moment().format('h:mm a'),
	};
}

function formatTracksForDisplayingAlbumForSpotify(
	tracks,
	albumCover,
	albumName,
	albumArtist
) {
	return tracks.map((track) => {
		return {
			trackName: track.name,
			artists: track.artists.map(({ name }) => name).join(', '),
			albumArtist: albumArtist,
			trackCover: albumCover,
			id: track.id,
			uri: track.uri,
			duration: track.duration_ms,
			albumName: albumName,
			formattedDuration: formatDuration(track.duration_ms),
		};
	});
}
function formatTracksForDisplayingAlbumForApple(
	tracks,
	albumCover,
	albumName,
	albumArtist
) {
	return tracks.map((track) => {
		return {
			trackName: formatter.appleFormatSearchQuery(track.attributes.name),
			artists: formatter.uniFormatArtistsForUi(track.attributes.artistName),
			albumArtist: albumArtist,
			trackCover: albumCover,
			id: track.id,
			uniId: track.attributes.isrc,
			duration: track.attributes.durationInMillis,
			albumName: albumName,
			formattedDuration: formatDuration(track.attributes.durationInMillis),
		};
	});
}

module.exports = {
	formatUniSearchResults,
	getSongDataForPlayers,
	uniAlbumSearch,
	formatMessage,
	uniSearch,
	getMissingProviderToken,
	likeSong,
	formatTracksForDisplayingAlbumForApple,
	formatTracksForDisplayingAlbumForSpotify,
};
