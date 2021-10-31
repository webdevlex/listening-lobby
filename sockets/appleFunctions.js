const axios = require("axios");

function searchSong(song, setSearchResults) {
  axios
    .get(
      "https://api.music.apple.com/v1/catalog/us/search?term=" +
        song +
        "&limit=5&types=songs",
      {
        headers: {
          Authorization:
            "Bearer " +
            "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZNVTNEODk2MlkifQ.eyJpYXQiOjE2MzM2MjM1OTQsImV4cCI6MTY0OTE3NTU5NCwiaXNzIjoiQkxTWFkzNk1GUiJ9.hu2W6jDCgMWqFIAkubHAbBnHqD5wpvy2XdOWc1-95_SYYCx-N8JZAwyFJIHgbKyPHorVlKIRjhunddxu03Nj0g",
        },
      }
    )
    .then((response) => {
      if (response.data.meta.results.order.length > 0) {
        setSearchResults(response.data.results.songs.data);
      } else {
        setSearchResults([]);
      }
    })
    .catch((error) => {
      setSearchResults([]);
    });
}

module.exports = {
  searchSong,
};
exports = module.exports;
