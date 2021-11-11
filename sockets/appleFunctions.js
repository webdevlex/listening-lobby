const axios = require("axios");
function formatQuery(query) {
  query = query.replaceAll("&", "and");
  query = query.replaceAll("with", "feat");
  query = query.replaceAll("’", "");
  return query;
}

async function appleSearch(query, token) {
  let defaultValue = {
    songs: {
      data: [],
    },
    albums: {
      data: [],
    },
  };
  let searchResults;
  query = formatQuery(query);
  console.log(query);

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
        searchResults = defaultValue;
      }
    })
    .catch((error) => {
      searchResults = defaultValue;
    });
  return searchResults;
}

async function appleSearchAndFormat(song, token) {
  const { trackName, artists, uniId } = song;
  const searchResult = await appleSearch(`${trackName} ${artists}`, token);
  //Temp loop to check each isrc vs uniId
  searchResult.songs.data.forEach((song) => {
    console.log(song.attributes.isrc + " " + uniId);
  });
  const result = searchResult.songs.data.find(
    (song) => song.attributes.isrc.substring(0, 8) === uniId.substring(0, 8)
  );

  if (!result) {
    //Temp catch error
    console.log("error");
    return { href: "", type: "", id: "" };
  }
  const { href, type, id } = result;
  return { href, type, id };
}

module.exports = {
  appleSearch,
  appleSearchAndFormat,
};
exports = module.exports;
