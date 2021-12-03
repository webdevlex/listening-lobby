const apple = require("./apple");
const spotify = require("./spotify");

// Format a message to be sent back to the front end
function formatMessage(username, message) {
  return {
    username: username,
    message: message,
  };
}

// Format apple search queries to allow cross platform queue adds
function appleFormatSearchQuery(query) {
  query = replaceAll(query, "&", "and");
  query = replaceAll(query, "with", "feat");
  query = replaceAll(query, "’", "");
  return query;
}
//Formats for cross platform searching for optimization - work in progress
function uniTrackFormatter(query) {
  query = replaceAll(query, "&", "and");
  query = replaceAll(query, "with", "");
  query = replaceAll(query, "feat.", "");
  query = replaceAll(query, "feat", "");
  query = replaceAll(query, "’", "");
  let indexFirst = query.indexOf("(");
  let indexLast = query.indexOf(")");
  if (indexFirst != -1 || indexLast != -1) {
    query = query.substr(0, indexFirst) + query.substr(indexLast + 1);
  }
  return query;
}
function uniArtistsFormatter(query) {
  query = replaceAll(query, "&", "");
  query = replaceAll(query, "and", "");
  query = replaceAll(query, ",", "");
  query = replaceAll(query, "with", "");
  query = replaceAll(query, "feat.", "");
  query = replaceAll(query, "feat", "");
  query = replaceAll(query, "’", "");
  // let index = query.indexOf(","); This will limit to one artist
  // if (index != -1) {
  //   query = query.substr(0, index);
  // }
  return query;
}

// Replace substring in string
// params: entire string, item to replace, replacement
function replaceAll(target, search, replacement) {
  return target.replace(new RegExp(search, "g"), replacement);
}

// Perform search for music provider that the user is using
async function uniSearch({ searchValue, user }) {
  const token = user.token;
  // If the user is using spotify player perform spotify search
  if (user.music_provider === "spotify") {
    return await spotify.search(searchValue, token);
  }
  // If the user is using apple player format their query then perform spotify search
  else {
    searchValue = appleFormatSearchQuery(searchValue);
    return await apple.search(searchValue, token);
  }
}

//  use users music provider to searches for songs and albums and return formatted results
function formatUniSearchResults(searchResults, { user }) {
  // Formatted search results
  let tracks = [];
  let albums = [];

  // If user is using spotify format search results for spotify
  if (user.music_provider === "spotify") {
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
  const tracks = searchResults.tracks.items;
  return tracks.map((track) => {
    return {
      trackName: track.name,
      artists: track.artists.map(({ name }) => name).join(", "),
      trackCover: track.album.images[0].url,
      id: track.id,
      uri: track.uri,
      uniId: track.external_ids.isrc,
    };
  });
}

// Pull out necessary album information from all spotify search results
function extractSpotifyAlbumData(searchResults) {
  const albums = searchResults.albums.items;
  return albums.map((album) => {
    return {
      albumName: album.name,
      artists: album.artists.map(({ name }) => name).join(", "),
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
  if (searchResults.songs) {
    const tracks = searchResults.songs.data;
    return tracks.map((track) => {
      return {
        href: track.href,
        type: track.type,
        trackName: appleFormatSearchQuery(track.attributes.name),
        artists: appleFormatSearchQuery(track.attributes.artistName),
        trackCover: track.attributes.artwork.url.replace("{w}x{h}", "640x640"),
        id: track.id,
        uniId: track.attributes.isrc,
      };
    });
  }
}

// Pull out necessary album information from all apple search results
function extractAppleAlbumData(searchResults) {
  // If there are search resutls for album
  if (searchResults.albums) {
    const albums = searchResults.albums.data;
    return albums.map((album) => {
      return {
        href: album.href,
        type: album.type,
        albumName: appleFormatSearchQuery(album.attributes.name),
        artists: appleFormatSearchQuery(album.attributes.artistName),
        albumCover: album.attributes.artwork.url.replace("{w}x{h}", "640x640"),
        id: album.id,
        songCount: album.attributes.trackCount,
        releaseDate: album.attributes.releaseDate,
      };
    });
  }
}

// Retrieves necessary song data for the active players in lobby
async function getSongDataForPlayers(tokens, { songData, user }) {
  // Tokens that will be used if a search is required
  const spotifyToken = tokens.spotify;
  const appleToken = tokens.apple;

  // The data that will be returned to the players
  let dataForSpotifyPlayer;
  let dataForApplePlayer;

  //This will format the track name to be optimal for cross platform searches

  let tempTrackName = songData.trackName;
  let tempArtistName = songData.artists;
  songData.trackName = uniTrackFormatter(songData.trackName);
  songData.artists = uniArtistsFormatter(songData.artists);
  // console.log(songData.trackName);
  // console.log(songData.artists);
  // If the user that made the request is using spotify
  if (user.music_provider === "spotify") {
    // We already have spotify data just format it
    dataForSpotifyPlayer = spotify.formatSongData(songData);

    // We do not have apple data so search for it then format it
    // Must first format search query for api call
    songData.trackName = appleFormatSearchQuery(songData.trackName);
    songData.artists = appleFormatSearchQuery(songData.artists);
    dataForApplePlayer = await apple.getAndFormatSongData(songData, appleToken);
  }
  // If the user that made the request is using apple
  else {
    // We do not have spotify data so search for it then format it
    dataForSpotifyPlayer = await spotify.getAndFormatSongData(
      songData,
      spotifyToken
    );
    // We already have apple data so just format it
    dataForApplePlayer = apple.formatSongData(songData);
  }
  songData.trackName = tempTrackName;
  songData.artists = tempArtistName;
  return { dataForSpotifyPlayer, dataForApplePlayer, dataForUi: songData };
}

// Retrieves necessary album data for the active players in lobby
async function uniAlbumSearch(players, { album, user }) {
  // Players in lobby
  const applePlayerCount = players.apple.count;
  const spotifyPlayerCount = players.spotify.count;

  // Tokens that will be used if a search is required
  const appleToken = players.apple.token;
  const spotifyToken = players.spotify.token;

  // The data that will be returned to the players and ui
  let dataForSpotifyPlayer;
  let dataForApplePlayer;
  let dataForUi;

  // If both spotify and apple players are being used
  if (applePlayerCount > 0 && spotifyPlayerCount > 0) {
    // If the user that made the request is using spotify
    if (user.music_provider === "spotify") {
      // We already have spotify data just format it for player and ui
      const albumData = await spotify.formatAlbum(album, spotifyToken);
      dataForSpotifyPlayer = albumData.dataForPlayer;
      dataForUi = albumData.dataForUi;

      // We do not have apple data so search for it then format it
      dataForApplePlayer = await apple.albumSearchAndFormat(album, appleToken);
      // The user that made the request is using apple
    } else {
      // We do not have spotify data so search for it then format it
      dataForSpotifyPlayer = await spotify.albumSearchAndFormat(
        album,
        spotifyToken
      );
      // We already have apple data so just format it for player and ui
      const albumData = await apple.formatAlbum(album, appleToken);
      dataForApplePlayer = albumData.appleAlbum;
      dataForUi = albumData.appleAlbumDisplay;
    }
    // If only spotify players are being used
  } else if (spotifyPlayerCount > 0) {
    // We already have spotify data just format it for player and ui
    const results = await spotify.formatAlbum(album, spotifyToken);
    dataForSpotifyPlayer = results.dataForPlayer;
    dataForUi = results.dataForUi;
    // If only apple players are being used
  } else {
    // We already have apple data so just format it for player and ui
    const results = await apple.formatAlbum(album, appleToken);
    dataForApplePlayer = results.appleAlbum;
    dataForUi = results.appleAlbumDisplay;
  }

  return {
    dataForSpotifyPlayer,
    dataForApplePlayer,
    dataForUi,
  };
}

async function generateTempToken(musicProvider) {
  return musicProvider !== "spotify"
    ? await spotify.getTempToken()
    : await apple.getTempToken();
}

module.exports = {
  formatUniSearchResults,
  getSongDataForPlayers,
  uniAlbumSearch,
  formatMessage,
  uniSearch,
  generateTempToken,
};
