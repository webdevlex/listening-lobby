const lobbyFunctions = require("./lobbyFunctions");
const spotifyFunctions = require("./spotifyFunctions");
const appleFunctions = require("./appleFunctions");
const helperFunctions = require("./helperFunctions");
const {
  createNewLobby,
  joinLobby,
  lobbyExists,
  getUserById,
  getMemberUsernames,
  addMessageToLobby,
  getLobbyMessages,
  getLobbyById,
  addSongToLobbyQueue,
} = lobbyFunctions;
const {
  playSong,
  spotifySearch,
  setupSpotifyUsersPlaylist,
  addSongToPlaylist,
  formatSongForSpotify,
  spotfiySearchAndFormat,
} = spotifyFunctions;
const { appleSearch, appleSearchAndFormat } = appleFunctions;
const { formatSearchResults, formatSongForApple } = helperFunctions;

function socketsHandler(io) {
  io.sockets.on("connection", function (socket) {
    console.log("----- connection -----");

    // Handle when someone creates lobby or joins lobby
    socket.on("joinLobby", async (data) => {
      const { lobby_id, username, music_provider, token } = data;
      data.user_id = socket.id;
      socket.join(lobby_id);

      if (music_provider === "spotify") {
        const playlistId = await setupSpotifyUsersPlaylist(token);
        data.playlistId = playlistId;
      }

      if (!lobbyExists(lobby_id)) {
        createNewLobby(data);
        io.to(lobby_id).emit("setLobbyInfo", {
          members: [username],
          lobbyMessages: [],
        });
      } else {
        joinLobby(data);
        // TODO also send queue to designated player and ui queue
        io.to(lobby_id).emit("setLobbyInfo", {
          members: getMemberUsernames(lobby_id),
          lobbyMessages: getLobbyMessages(lobby_id),
        });
      }
    });

    // TODO: make sure used players gets updated on leave
    socket.on("disconnect", () => {
      console.log("----- disconnected -----");
    });

    // Handle when someone send a message in their lobby
    socket.on("message", ({ lobby_id, message }) => {
      const user = getUserById(lobby_id, socket.id);
      addMessageToLobby(lobby_id, message, user.username);
      io.to(lobby_id).emit("lobbyMessage", getLobbyMessages(lobby_id));
    });

    // Handle Apple search request
    socket.on("appleSearch", async (song, lobby_id) => {
      const user = getUserById(lobby_id, socket.id);
      let searchResults = await appleSearch(song, user.token);
      io.to(socket.id).emit("appleSearchResults", searchResults);
    });

    // Handle Spotify and apple search request
    socket.on("uniSearch", async (searchValue, token, { music_provider }) => {
      let searchResults;
      if (music_provider === "spotify") {
        searchResults = await spotifySearch(searchValue, token);
      } else {
        searchResults = await appleSearch(searchValue, token);
      }

      const formattedSearchResults = formatSearchResults(
        searchResults,
        music_provider
      );

      io.to(socket.id).emit("uniSearchResults", formattedSearchResults);
    });

    // Handle adding song to queue
    // TODO Clean this
    socket.on("addSongToQueue", async (song, user) => {
      const { lobby_id, music_provider } = user;
      const lobby = getLobbyById(lobby_id);
      const players = lobby.players;

      const applePlayerCount = players.apple.count;
      const spotifyPlayerCount = players.spotify.count;

      const appleToken = players.apple.token;
      const spotifyToken = players.spotify.token;

      let spotifySong;
      let appleSong;

      if (applePlayerCount > 0 && spotifyPlayerCount > 0) {
        if (music_provider === "spotify") {
          spotifySong = formatSongForSpotify(song);
          appleSong = await appleSearchAndFormat(song, appleToken);
        } else {
          spotifySong = await spotfiySearchAndFormat(song, spotifyToken);
          appleSong = formatSongForApple(song);
        }
      } else if (spotifyPlayerCount > 0) {
        spotifySong = formatSongForSpotify(song);
      } else {
        appleSong = formatSongForApple(song);
      }

      addSongToLobbyQueue(lobby_id, song);
      const { users, queue: queueDisplay } = getLobbyById(lobby_id);

      io.to(lobby_id).emit("updateLobbyQueue", queueDisplay);

      users.forEach((user) => {
        if (user.music_provider === "spotify") {
          addSongToPlaylist(spotifySong, user);
        } else {
          io.to(user.user_id).emit("updateAppleQueue", appleSong);
        }
      });
    });

    // Handle adding album to queue
    socket.on("addAlbumToQueue", (album, user) => {
      console.log("album attempted to be added");
    });

    // Handle when someone clicks play
    socket.on("playSong", (lobby_id) => {
      const members = getLobbyById(lobby_id).users;
      members.forEach(({ music_provider, token, user_id }) => {
        if (music_provider === "spotify") {
          playSong(token);
        } else {
          io.to(user_id).emit("playApple");
        }
      });
    });
  });
}

module.exports = socketsHandler;
exports = module.exports;
