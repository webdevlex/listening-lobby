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
  query = query.toLowerCase();
  query = replaceAll(query, "&", "and");
  query = query.split("f**k").join("fuck");
  query = query.split("n***a").join("nigga");
  query = replaceAll(query, "EP", "");
  query = replaceAll(query, "-", "");
  query = replaceAll(query, "with", "");
  query = replaceAll(query, "feat.", "");
  query = replaceAll(query, "feat", "");
  query = replaceAll(query, "’", "");
  let paraFirst = query.indexOf("(");
  let paraLast = query.indexOf(")");
  let bracketFirst = query.indexOf("[");
  let bracketLast = query.indexOf("]");
  if (paraFirst != -1 || paraLast != -1) {
    query = query.substr(0, paraFirst) + query.substr(paraLast + 1);
  }
  if (bracketFirst != -1 || bracketLast != -1) {
    query = query.substr(0, bracketFirst) + query.substr(bracketLast + 1);
  }
  return query;
}

function uniAlbumNameFormatter(query, deleteWhiteSpaces) {
  query = query.toLowerCase();
  query = replaceAll(query, "-", "");
  query = query.split(".").join("");
  query = query.split(",").join("");
  query = replaceAll(query, "&", "and");
  query = query.split("f**k").join("fuck");
  query = query.split("n***a").join("nigga");
  query = replaceAll(query, " ep", "");
  query = replaceAll(query, " version", "");
  query = replaceAll(query, " remix", "");
  query = replaceAll(query, "single", "");
  query = replaceAll(query, "with", "");
  query = replaceAll(query, "feat.", "");
  query = replaceAll(query, "feat", "");
  query = replaceAll(query, "’", "");
  let paraFirst = query.indexOf("(");
  let paraLast = query.indexOf(")");
  let bracketFirst = query.indexOf("[");
  let bracketLast = query.indexOf("]");
  if (paraFirst != -1 || paraLast != -1) {
    query = query.substr(0, paraFirst) + query.substr(paraLast + 1);
  }
  if (bracketFirst != -1 || bracketLast != -1) {
    query = query.substr(0, bracketFirst) + query.substr(bracketLast + 1);
  }

  if (deleteWhiteSpaces) {
    query = replaceAll(query, " ", "");
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
function uniAlbumArtistsFormatter(query) {
  query = replaceAll(query, "&", "");
  query = replaceAll(query, "and", "");

  query = replaceAll(query, "with", "");
  query = replaceAll(query, "feat.", "");
  query = replaceAll(query, "feat", "");
  query = replaceAll(query, "’", "");
  let index = query.indexOf(",");
  if (index != -1) {
    query = query.substr(0, index);
  }
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
  if (!searchResults) return [];
  const tracks = searchResults.tracks.items;
  return tracks.map((track) => {
    return {
      trackName: track.name,
      artists: track.artists.map(({ name }) => name).join(", "),
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
  if (!searchResults) return [];

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
      duration: track.attributes.durationInMillis,
      formattedDuration: formatDuration(track.attributes.durationInMillis),
    };
  });
}

// Pull out necessary album information from all apple search results
function extractAppleAlbumData(searchResults) {
  // If there are search resutls for album
  if (!searchResults) return [];
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

  // If the user that made the request is using spotify
  if (user.music_provider === "spotify") {
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
async function uniAlbumSearch(tokens, { albumData, user }) {
  // Tokens that will be used if a search is required
  const spotifyToken = tokens.spotify;
  const appleToken = tokens.apple;

  // The data that will be returned to the players
  let dataForSpotifyPlayer;
  let dataForApplePlayer;
  let dataForUi;

  albumData.albumName = uniAlbumNameFormatter(albumData.albumName);
  albumData.artists = uniAlbumArtistsFormatter(albumData.artists);

  if (user.music_provider === "spotify") {
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
      uniAlbumNameFormatter,
      appleToken
    );
    if (appleAlbumId) {
      dataForApplePlayer = await apple.getAlbumSongsIdByAlbumId(
        appleAlbumId,
        appleToken,
        dataForUi
      );
      // } else {
      //   for (let i = 0; i < albumData.songCount; ++i) {
      //     dataForApplePlayer.push("-1");
      //   }
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
      uniAlbumNameFormatter,
      spotifyToken
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

async function generateTempToken(musicProvider) {
  return musicProvider !== "spotify"
    ? await spotify.getTempToken()
    : await apple.getTempToken();
}

function likeSong(data) {
  spotify.likeSong(data);
}

function formatDuration(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

module.exports = {
  formatUniSearchResults,
  getSongDataForPlayers,
  uniAlbumSearch,
  formatMessage,
  uniSearch,
  generateTempToken,
  likeSong,
};
