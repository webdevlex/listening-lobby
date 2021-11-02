const axios = require("axios");

async function appleSearch(query, token) {
  let searchResults;
  await axios
    .get(
      "https://api.music.apple.com/v1/catalog/us/search?term=" +
        query +
        "&limit=5&types=songs,albums",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    )
    .then((response) => {
      if (response.data.meta.results.order.length > 0) {
        searchResults = response.data.results;
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
  appleSearch,
};
exports = module.exports;
