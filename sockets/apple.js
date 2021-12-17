const axios = require("axios");

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
  const LIMIT = 10;
  const endPoint = `https://api.music.apple.com/v1/catalog/us/search?term=${searchName}&limit=${LIMIT}&types=songs,albums`;
  const config = {
    headers: {
      Authorization: "Bearer " + token,
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
    console.log(
      "Apple Api Error:",
      err.response.status,
      err.response.statusText
    );
  }
}

function songMatchTesting(rawResults, trackName, artists, uniId, duration) {
  console.log(trackName, artists);
  rawResults.songs.data.every((song) => {
    console.log(
      "Test 1: ",

      song.attributes.isrc === uniId,
      song.attributes.isrc,
      uniId
    );
    console.log(
      "Test 2: ",
      song.attributes.durationInMillis + 500 >= duration &&
        song.attributes.durationInMillis - 500 <= duration,
      duration,
      song.attributes.durationInMillis
    );
    if (
      song.attributes.isrc === uniId ||
      (song.attributes.isrc.substring(0, 7) === uniId.substring(0, 7) &&
        song.attributes.durationInMillis + 500 >= duration &&
        song.attributes.durationInMillis - 500 <= duration)
    ) {
      console.log("Match!");
      return false;
    }
    return true;
  });
}
async function getAndFormatSongData(
  { trackName, artists, duration, uniId },
  token
) {
  const searchResult = await search(`${trackName} ${artists}`, token);
  if (!searchResult) return searchResult;
  songMatchTesting(searchResult, trackName, artists, uniId, duration);
  let songMatch = searchResult.songs.data.find(
    (song) =>
      song.attributes.isrc === uniId ||
      (song.attributes.isrc.substring(0, 7) === uniId.substring(0, 7) &&
        song.attributes.durationInMillis + 500 >= duration &&
        song.attributes.durationInMillis - 500 <= duration)
  );
  if (!songMatch) {
    console.log("No song match");
  }
  songMatch = songMatch ? songMatch : { id: "-1" };
  return songMatch.id;
}
function albumMatchTesting(
  rawResults,
  albumName,
  releaseDate,
  songCount,
  uniAlbumNameFormatter
) {
  rawResults.every(({ attributes }) => {
    console.log(
      "Test 1: ",
      songCount === attributes.trackCount,
      songCount,
      attributes.trackCount
    );
    console.log("-------------------------");
    console.log(
      "Test 2: ",
      uniAlbumNameFormatter(attributes.name, true) ===
        uniAlbumNameFormatter(albumName, true),
      uniAlbumNameFormatter(attributes.name, true),
      uniAlbumNameFormatter(albumName, true)
    );
    console.log(
      "Release Date: ",
      attributes.releaseDate === releaseDate,
      attributes.releaseDate,
      releaseDate
    );
    if (
      songCount === attributes.trackCount &&
      (uniAlbumNameFormatter(attributes.name) === albumName ||
        attributes.releaseDate === releaseDate)
    ) {
      return false;
    }
    return true;
  });
}
//Searching from Spotify
async function getAlbumId(
  { albumName, releaseDate, songCount },
  uniAlbumNameFormatter,
  token
) {
  const searchResults = await appleAlbumSearch(albumName, token);
  if (!searchResults) return searchResults;
  albumMatchTesting(
    searchResults,
    albumName,
    releaseDate,
    songCount,
    uniAlbumNameFormatter
  );
  let albumMatch = searchResults.find(
    ({ attributes }) =>
      songCount === attributes.trackCount &&
      (uniAlbumNameFormatter(attributes.name, true) ===
        uniAlbumNameFormatter(albumName, true) ||
        attributes.releaseDate === releaseDate)
  );
  if (albumMatch) {
    console.log("Match!");
    return albumMatch.id;
  } else {
    console.log("No Match");
    return albumMatch;
  }
}

async function appleAlbumSearch(albumName, token) {
  const endPoint = `https://api.music.apple.com/v1/catalog/us/search?term=${albumName}&limit=10&types=albums`;
  const config = {
    headers: {
      Authorization: "Bearer " + token,
    },
  };

  try {
    const res = await axios.get(endPoint, config);
    return res.data.results.albums.data;
  } catch (err) {
    console.log(
      "Apple Api Error:",
      err.response.status,
      err.response.statusText
    );
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
      Authorization: "Bearer " + token,
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

async function formatAlbumData(
  albumData,
  appleToken,
  formatDuration,
  { username }
) {
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
      addedBy: username,
      formattedDuration: formatDuration(track.attributes.durationInMillis),
    });
  });

  return { dataForApplePlayer, dataForUi };
}

async function getTempToken() {
  const endPoint = "http://localhost:8888/apple/token";

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
