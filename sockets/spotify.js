const axios = require("axios");

// Make request to spotify api to start the player
async function playSong(token) {
  const endPoint = "https://api.spotify.com/v1/me/player/play";
  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  try {
    await axios.put(endPoint, {}, config);
  } catch (err) {}
}

// Search for a song using apple data and return the id of the result
async function getAndFormatSongData(
  { trackName, artists, uniId },
  spotifyToken
) {
  const searchResult = await search(`${trackName} ${artists}`, spotifyToken);

  const result = searchResult.tracks.items.find(
    (song) => song.external_ids.isrc === uniId
  );
  return result.id;
}

// Format song for spotify player
function formatSongData(song) {
  return song.id;
}

// search for album and gather necessary data for player and ui
async function formatAlbum(album, token) {
  // Search for album by id through spotify api
  const results = await spotifyAlbumSearchById(album, token);

  let dataForPlayers = [];
  let dataForUi = [];

  // Iterate through each song and grab necessary data
  results.items.forEach((track) => {
    // Data player needs
    dataForPlayers.push(track.uri);
    // Data ui needs
    dataForUi.push({
      trackName: track.name,
      artists: track.artists.map(({ name }) => name).join(", "),
      trackCover: album.albumCover,
      id: track.id,
    });
  });

  return { spotifyAlbum: dataForPlayers, spotifyAlbumDisplay: dataForUi };
}

async function albumSearchAndFormat(album, token) {
  const searchValue = `${album.albumName} ${album.artists}`;
  const searchLimit = 20;
  const searchResults = await spotifyAlbumSearchByQuery(
    searchValue,
    token,
    searchLimit
  );
  const result = searchResults.albums.items.find(
    (currentAlbum) => currentAlbum.name === album.albumName
  );
  const spotifyAlbum = await spotifyAlbumSearchById(result, token);
  let allAlbumUris = [];
  spotifyAlbum.items.forEach((track) => {
    allAlbumUris.push(track.uri);
  });
  return allAlbumUris;
}

async function spotifyAlbumSearchById(album, token) {
  const endPoint = `	https://api.spotify.com/v1/albums/${album.id}/tracks`;
  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  };
  try {
    const res = await axios.get(endPoint, config);
    return res.data;
  } catch (err) {
    // console.log(err);
  }
}

async function spotifyAlbumSearchByQuery(searchValue, token) {
  const endPoint = "	https://api.spotify.com/v1/search";
  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
    params: {
      q: searchValue,
      type: "album",
      limit: 20,
    },
  };

  try {
    const res = await axios.get(endPoint, config);
    return res.data;
  } catch (err) {
    console.log(err.response.status);
  }
}

async function search(searchValue, token) {
  const endPoint = "	https://api.spotify.com/v1/search";
  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
    params: {
      q: searchValue,
      type: "album,track",
      limit: 5,
    },
  };

  try {
    const res = await axios.get(endPoint, config);
    return res.data;
  } catch (err) {
    console.log(err.response.status);
  }
}

async function createTempPlaylist(token) {
  const user = await getUserData(token);
  const uri = await createPlaylist(token, user.data.id);
  return uri;
}

async function getUserData(token) {
  const endPoint = "https://api.spotify.com/v1/me";
  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  try {
    const user = await axios.get(endPoint, config);
    return user;
  } catch (err) {
    console.log(err);
  }
}

async function createPlaylist(token, id) {
  const endPoint = `https://api.spotify.com/v1/users/${id}/playlists`;
  const body = {
    name: "Listening Party!",
    description: "A temporary playlist used for our app to work",
    public: false,
  };
  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  try {
    const res = await axios.post(endPoint, body, config);
    return res.data.id;
  } catch (err) {
    console.log(err);
  }
}

async function addSongToPlaylist(songId, user) {
  const { token, playlistId } = user;
  const endPoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const body = {
    uris: [`spotify:track:${songId}`],
  };
  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  try {
    await axios.post(endPoint, body, config);
  } catch (err) {
    console.log(err);
  }
}

async function addAlbumToPlaylist(uriArray, user) {
  const { token, playlistId } = user;
  const endPoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const body = {
    uris: uriArray,
  };
  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  try {
    await axios.post(endPoint, body, config);
  } catch (err) {
    console.log(err);
  }
}

//TODO when first song in queue is added
async function setPlaybackToNewPlaylist(device_id, uri, token) {
  const endPoint = "https://api.spotify.com/v1/me/player/play";
  const body = {
    device_id: device_id,
    context_uri: uri,
    offset: {
      position: 0,
    },
    position_ms: 0,
  };
  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  try {
    const res = await axios.put(endPoint, body, config);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  playSong,
  search,
  createTempPlaylist,
  addSongToPlaylist,
  formatSongData,
  getAndFormatSongData,
  formatAlbum,
  addAlbumToPlaylist,
  albumSearchAndFormat,
};
