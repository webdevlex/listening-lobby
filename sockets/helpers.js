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

// Replace substring in string
// params: entire string, item to replace, replacement
function replaceAll(target, search, replacement) {
  return target.replace(new RegExp(search, "g"), replacement);
}

async function uniSearch({ searchValue, user }) {
  const token = user.token;
  // If the user is using spotify player perform spotify search
  if (user.music_provider === "spotify") {
    return await spotify.search(searchValue, token);
    // If the user is using apple player perform spotify search
  } else {
    searchValue = appleFormatSearchQuery(searchValue);
    return await apple.search(searchValue, token);
  }
}

function formatSearchResults(searchResults, { user }) {
  let necessaryTrackInfo = [];
  let necessaryAlbumInfo = [];

  if (user.music_provider === "spotify") {
    const albums = searchResults.albums.items;
    const tracks = searchResults.tracks.items;

    necessaryTrackInfo = tracks.map((track) => {
      return {
        trackName: track.name,
        artists: track.artists.map(({ name }) => name).join(", "),
        trackCover: track.album.images[0].url,
        id: track.id,
        uniId: track.external_ids.isrc,
      };
    });

    necessaryAlbumInfo = albums.map((album) => {
      return {
        albumName: album.name,
        artists: album.artists.map(({ name }) => name).join(", "),
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
            "{w}x{h}",
            "640x640"
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
            "{w}x{h}",
            "640x640"
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

// Retrieves necessary data for the active players in lobby
async function getSongDataForPlayers(players, { songData, user }) {
  // Players in lobby
  const applePlayerCount = players.apple.count;
  const spotifyPlayerCount = players.spotify.count;

  // Tokens that will be used if a search is required
  const appleToken = players.apple.token;
  const spotifyToken = players.spotify.token;

  // The data that will be returned to the player the players
  let dataForSpotifyPlayer;
  let dataForApplePlayer;

  // If both spotify and apple players are being used
  if (applePlayerCount > 0 && spotifyPlayerCount > 0) {
    // If the user that made the request is using spotify
    if (user.music_provider === "spotify") {
      dataForSpotifyPlayer = spotify.formatSongData(songData);
      dataForApplePlayer = await apple.getAndFormatSongData(
        songData,
        appleToken
      );
      // If the user that made the request is using apple
    } else {
      dataForSpotifyPlayer = await spotify.getAndFormatSongData(
        songData,
        spotifyToken
      );
      dataForApplePlayer = apple.formatSongData(songData);
    }
    // If only spotify players are being used
  } else if (spotifyPlayerCount > 0) {
    dataForSpotifyPlayer = spotify.formatSongData(songData);
    // If only apple players are being used
  } else {
    dataForApplePlayer = apple.formatSongData(songData);
  }

  return { dataForSpotifyPlayer, dataForApplePlayer };
}

async function uniAlbumSearch(players, { album, user }) {
  const applePlayerCount = players.apple.count;
  const spotifyPlayerCount = players.spotify.count;

  const appleToken = players.apple.token;
  const spotifyToken = players.spotify.token;

  let spotifyAlbum;
  let appleAlbum;
  let allTracksDisplay;

  if (applePlayerCount > 0 && spotifyPlayerCount > 0) {
    if (user.music_provider === "spotify") {
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

module.exports = {
  formatSearchResults,
  getSongDataForPlayers,
  uniAlbumSearch,
  formatMessage,
  uniSearch,
};
