const axios = require("axios");

async function searchSong(song, token) {
  let searchResults;
  await axios
    .get(
      "https://api.music.apple.com/v1/catalog/us/search?term=" +
        song +
        "&limit=5&types=songs",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    )
    .then((response) => {
      if (response.data.meta.results.order.length > 0) {
        searchResults = response.data.results.songs.data;
      } else {
        searchResults = [];
      }
    })
    .catch((error) => {
      searchResults = [];
    });
  return searchResults;
}

module.exports = {
  searchSong,
};
exports = module.exports;
