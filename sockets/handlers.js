const lobby = require("./lobby");
const helpers = require("./helpers");

const LOBBY_MAX_CAPACITY = 8;
const KICK_WAIT_TIME_IN_MILLIS = 10000;
const ARTIST_SEARCH_RESULTS_AMOUNT = 25;

// ========
// = Join =
// ========
async function joinLobby(io, socket, data) {
  const { lobby_id } = data;
  data.user_id = socket.id;

  socket.join(lobby_id);

  if (!lobby.lobbyExists(lobby_id)) {
    // Get token for music provider that admin is NOT using
    const tempToken = await helpers.generateTempToken(data.music_provider);

    // Create and join lobby
    lobby.generateLobby(data, tempToken);
    const members = lobby.getMembers(lobby_id);
    const messages = [];
    const adminData = lobby.getAdminData(data);

    // Send new lobby data back to members
    io.to(lobby_id).emit("setLobbyInfo", members, messages);
    io.to(lobby_id).emit("doneLoading", {});
    io.to(lobby_id).emit("setAdmin", adminData.user_id);
    io.to(socket.id).emit("setNewUserData", data);
    operatorMessage(io, "Welcome to the listening lobby!", lobby_id);
  }
  // Lobby exists
  else {
    const lobbyRef = lobby.getLobbyById(lobby_id);
    lobby.joinLobby(data);

    // If not exceeding the limit then join existing lobby
    if (lobbyRef.users.length < LOBBY_MAX_CAPACITY) {
      io.to(lobby_id).emit("deactivateButtons");

      const members = lobby.getMembers(lobby_id);
      const messages = lobby.getLobbyMessages(lobby_id);

      // Send new lobby data back to all members
      io.to(lobby_id).emit("setLobbyInfo", members, messages);
      io.to(socket.id).emit("addSong", lobbyRef.queue);

      const lobbyNotLoading = !lobbyRef.loading;
      if (lobbyNotLoading) {
        setLobbyToLoading(io, lobby_id);
        socket.broadcast.emit("getUserReady");
      }

      const adminData = lobby.getAdminData(data);
      io.to(lobby_id).emit("setAdmin", adminData.user_id);
      io.to(adminData.user_id).emit("getPlayerData", socket.id);
      operatorMessage(io, `${data.username} joined the lobby!`, lobby_id);
    }
    // Limit reached dont allow them to join
    else {
      io.to(socket.id).emit("lobbyMaxReached");
    }
  }
}

// ==============
// = Disconnect =
// ==============
async function disconnect(io, socket) {
  console.log("----- disconnection -----");
  // Get lobby data
  const lobbyRef = lobby.getLobbyByUserId(socket.id);

  // Notify the lobby that this user left
  const member = lobby.getUserById(lobbyRef.lobby_id, socket.id);
  operatorMessage(io, `${member.username} left the lobby.`, lobbyRef.lobby_id);

  // Remove the member who left from the lobby
  const i = lobby.leaveLobby(lobbyRef, socket.id);

  // If there is no more users left in the lobby delete the entire lobby
  if (lobbyRef.users.length === 0) {
    lobby.deleteLobbyByIndex(i);
  }
  // If there is still users in the lobby just remove the person who left and update everyones ui
  else {
    const members = lobby.getMembers(lobbyRef.lobby_id);
    const messages = lobby.getLobbyMessages(lobbyRef.lobby_id);
    io.to(lobbyRef.lobby_id).emit("setLobbyInfo", members, messages);

    // If the admin leaves set the next person in the members array as admin
    if (lobbyRef.users[0].privilege !== "admin") {
      lobby.setFirstMemberAsAdmin(i);
      const adminData = lobby.getAdminData({ lobby_id: lobbyRef.lobby_id });
      io.to(lobbyRef.lobby_id).emit("setAdmin", adminData.user_id);
    }

    // Check if the person left while buttons were loading
    if (lobbyRef.usersReady.length === lobbyRef.users.length) {
      io.to(lobbyRef.lobby_id).emit("activateButtons");
      lobby.resetReady(lobbyRef.lobby_id);
    }
  }
}

// ===========
// = Message =
// ===========
function lobbyMessage(io, socket, { user, message }) {
  // Format message for front end
  const formattedMessage = helpers.formatMessage(user.username, message);
  // Add message to lobby
  const messages = lobby.addMessageToLobby(formattedMessage, user.lobby_id);
  // Send all messages to members in lobby
  io.to(user.lobby_id).emit("lobbyMessage", messages);
}

// ==========
// = Search =
// ==========
async function search(io, socket, data) {
  // Perform search using the music provider of user that made the request
  data.user.user_id = socket.id;
  let searchResults = await helpers.uniSearch(data);
  // Format search results for front-end
  const formattedResults = helpers.formatUniSearchResults(searchResults, data);
  // Send results back to user who made the request
  io.to(socket.id).emit("uniSearchResults", formattedResults);
}

// ============
// = Add Song =
// ============
async function addSong(io, socket, data) {
  // Get lobby data
  const lobbyRef = lobby.getLobbyById(data.user.lobby_id);
  io.to(data.user.lobby_id).emit("deactivateButtons");
  setLobbyToLoading(io, data.user.lobby_id);

  // Perform the necessary searches and return an object containing display for ui and data for each player

  let allSongData = await helpers.getSongDataForPlayers(lobbyRef.tokens, data);
  // Make sure the ui knows who added the song
  allSongData.dataForUi.addedBy = data.user.username;

  // Add song to lobby
  lobby.addSongToLobby(data.user.lobby_id, allSongData);

  // Send front end the data for ui, spotify player, and apple player
  io.to(data.user.lobby_id).emit("addSong", lobbyRef.queue);
  io.to(socket.id).emit("addCheck", data.songData.uniId);
  if (lobbyRef.queue.length === 1) {
    io.to(data.user.lobby_id).emit("firstSong", lobbyRef.queue);
  } else {
    setLobbyToNotLoading(data.user.lobby_id);
    io.to(data.user.lobby_id).emit("activateButtons");
  }
}

// =============
// = Add album =
// =============
async function addAlbum(io, socket, data) {
  // Get lobby data
  const lobbyRef = lobby.getLobbyById(data.user.lobby_id);
  io.to(data.user.lobby_id).emit("deactivateButtons");
  setLobbyToLoading(io, data.user.lobby_id);

  // Check if first time a song/album is added to the queue
  let firstSong;
  if (lobbyRef.queue.length === 0) {
    firstSong = true;
  }

  // Perform the necessary searches and return an object containing display for ui and song data for each player
  const allSongData = await helpers.uniAlbumSearch(lobbyRef.tokens, data);
  const appleFound = allSongData.dataForApplePlayer;
  const spotifyFound = allSongData.dataForSpotifyPlayer;
  const missingOn = spotifyFound ? "apple" : "spotify";

  // add all album songs to queue
  if (appleFound && spotifyFound) {
    lobby.addAlbumToLobby(data.user.lobby_id, allSongData);

    // Send front end the data for ui, spotify player, and apple player
    io.to(data.user.lobby_id).emit("addSong", lobbyRef.queue);
    io.to(socket.id).emit("addCheck", data.albumData.id);

    if (firstSong) {
      io.to(data.user.lobby_id).emit("firstSong", lobbyRef.queue);
    } else {
      setLobbyToNotLoading(data.user.lobby_id);
      io.to(data.user.lobby_id).emit("activateButtons");
    }
  } else {
    allSongData.albumId = data.albumData.id;
    lobby.setAlbumHold(data.user.lobby_id, allSongData);
    setLobbyToNotLoading(data.user.lobby_id);
    io.to(data.user.lobby_id).emit("activateButtons");
    io.to(socket.id).emit("questionAlbumAdd", missingOn);
  }
}

// ========
// = Play =
// ========
function play(io, socket, { user }) {
  let lobbyRef = lobby.getLobbyById(user.lobby_id);
  const play = lobby.updatePlayStatus(user.lobby_id);
  const shuffleMode = lobbyRef.shuffleMode;

  if (shuffleMode && !lobbyRef.playback) {
    const queue = lobby.shuffleQueue(user.lobby_id);
    io.to(user.lobby_id).emit("addSong", queue);
    lobbyRef.queue[0].shuffled = true;
  } else {
    lobbyRef.queue[0].shuffled = false;
  }

  if (lobbyRef.queue.length > 0) {
    io.to(user.lobby_id).emit("deactivateButtons");
    setLobbyToLoading(io, user.lobby_id);

    if (play) {
      io.to(user.lobby_id).emit("play", lobbyRef.queue[0]);
    } else {
      io.to(user.lobby_id).emit("pause", lobbyRef.queue[0]);
    }
  }

  lobby.playbackOn(user.lobby_id);
}

// ========
// = Skip =
// ========
function skip(io, socket, { user }) {
  const lobbyRef = lobby.getLobbyById(user.lobby_id);
  const shuffleMode = lobbyRef.shuffleMode;

  if (lobbyRef.queue.length > 0) {
    lobby.popSong(user.lobby_id);
    let queue = shuffleMode
      ? lobby.shuffleQueue(user.lobby_id)
      : lobbyRef.queue;
    io.to(user.lobby_id).emit("addSong", queue);
    io.to(user.lobby_id).emit("deactivateButtons");
    operatorMessage(
      io,
      `${user.username} skipped the song.`,
      lobbyRef.lobby_id
    );
    setLobbyToLoading(io, user.lobby_id);

    if (lobbyRef.queue.length === 0) {
      lobby.playbackOff(user.lobby_id);
      lobby.setPlayStatusPaused(user.lobby_id);
      io.to(user.lobby_id).emit("emptyQueue", queue);
    } else {
      lobby.setPlayStatusPlaying(user.lobby_id);
      io.to(user.lobby_id).emit("popped", queue);
    }
  }
}

// =========================
// = Get Admin Player Data =
// =========================
function playerData(io, socket, data) {
  const member = lobby.getMostRecentlyJoined(data);
  socket.to(member.user_id).emit("doneLoading", {
    paused: data.paused,
    timestamp: data.timestamp,
  });
}

// ================
// = Media Change =
// ================
function mediaChange(io, socket, { user }) {
  if (!lobby.inTimeout(user.lobby_id)) {
    lobby.setTimeoutTo(user.lobby_id, true);
    startInterval(user.lobby_id);
    const lobbyRef = lobby.getLobbyById(user.lobby_id);
    const shuffleMode = lobbyRef.shuffleMode;
    if (lobbyRef.queue.length > 0) {
      lobby.popSong(user.lobby_id);
      let queue = shuffleMode
        ? lobby.shuffleQueue(user.lobby_id)
        : lobbyRef.queue;

      io.to(user.lobby_id).emit("addSong", queue);
      io.to(user.lobby_id).emit("deactivateButtons");
      setLobbyToLoading(io, user.lobby_id);

      if (queue.length === 0) {
        lobby.setPlayStatusPaused(user.lobby_id);
        lobby.playbackOff(user.lobby_id);
        io.to(user.lobby_id).emit("emptyQueue", queue);
      } else {
        lobby.setPlayStatusPlaying(user.lobby_id);
        io.to(user.lobby_id).emit("popped", queue);
      }
    }
  }
}

function startInterval(lobby_id) {
  setTimeout(() => {
    if (lobby.lobbyExists(lobby_id)) {
      lobby.setTimeoutTo(lobby_id, false);
    }
  }, 10000);
}

// ================
// = Remove Song =
// ================
function remove(io, socket, { index, user, songName }) {
  const lobby_id = user.lobby_id;
  const lobbyRef = lobby.getLobbyById(lobby_id);
  io.to(lobby_id).emit("deactivateButtons");
  setLobbyToLoading(io, lobby_id);

  const isFirstSong = index === 0;
  if (isFirstSong) {
    lobby.popSong(lobby_id);

    if (lobbyRef.queue.length === 0) {
      lobby.setPlayStatusPaused(lobby_id);
      lobby.playbackOff(user.lobby_id);
      io.to(lobby_id).emit("emptyQueue", lobbyRef.queue);
    } else {
      io.to(lobby_id).emit("removeFirst", lobbyRef.queue, lobbyRef.playing);
    }
  } else {
    io.to(lobby_id).emit("activateButtons");
    setLobbyToNotLoading(lobby_id);
    lobby.removeSong(index, lobby_id);
  }
  io.to(lobby_id).emit("addSong", lobbyRef.queue);
  operatorMessage(io, `${user.username} removed ${songName}.`, lobby_id);
}

// ==============
// = User Ready =
// ==============
function userReady(io, socket, { user }) {
  const lobbyRef = lobby.getLobbyById(user.lobby_id);
  user.user_id = socket.id;
  lobby.addUserToReady(user);

  if (lobbyRef.usersReady.length === lobbyRef.users.length) {
    console.log("--------- everyone done loading ----------");
    io.to(user.lobby_id).emit("activateButtons");
    setLobbyToNotLoading(user.lobby_id);
    lobby.resetReady(user.lobby_id);
  }
}

function setLobbyToNotLoading(lobby_id) {
  lobby.setLobbyLoading(lobby_id, false);
  clearInterval(kickAfterTimeInterval);
  kickAfterTimeInterval = null;
}

function setLobbyToLoading(io, lobby_id) {
  lobby.setLobbyLoading(lobby_id, true);
  waitSomeTimeThenKickAnyoneWhoIsNotReady(io, lobby_id);
}

let kickAfterTimeInterval = null;
function waitSomeTimeThenKickAnyoneWhoIsNotReady(io, lobby_id) {
  kickAfterTimeInterval = setTimeout(() => {
    if (lobby.lobbyExists(lobby_id)) {
      const lobbyRef = lobby.getLobbyById(lobby_id);
      const usersWhoAreReady = lobbyRef.usersReady;
      const allUsers = lobbyRef.users;
      const usersWhoWillBeKicked = allUsers.filter(
        ({ user_id }) => !containMatch(usersWhoAreReady, user_id)
      );
      kickUsers(io, usersWhoWillBeKicked);
    }
  }, KICK_WAIT_TIME_IN_MILLIS);
}

function containMatch(arrayToCheck, idWeAreLookingFor) {
  return arrayToCheck.some(({ user_id }) => user_id === idWeAreLookingFor);
}

function kickUsers(io, users) {
  users.forEach(({ user_id, username }) => {
    io.to(user_id).emit("kickUser");
  });
}

// function kickUsersWhoAreNotReady(io, lobby_id) {
// 	const lobbyRef = lobby.getLobbyById(lobby_id);

// 	if (!lobbyRef.usersReadyTimeout) {
// 		lobby.setUsersReadyTimeoutActive(lobby_id);

// 		kickAfterTimeInterval = setTimeout(() => {
// 			if (lobby.lobbyExists(lobby_id)) {
// 				const lobbyRef = lobby.getLobbyById(lobby_id);
// 				const notEveryoneDoneloading = lobbyRef.loading;
// 				const noLoadingOverlap = lobbyRef.everyLoadedSuccessfullyCount === 0;

// 				lobby.setUsersReadyTimeoutOff(lobby_id);
// 				lobby.setLoadingOverlapToZero(lobby_id);

// 				if (notEveryoneDoneloading && noLoadingOverlap) {
// 					const usersWhoAreReady = lobbyRef.usersReady;
// 					const allUsers = lobbyRef.users;
// 					const usersWhoWillBeKicked = allUsers.filter(
// 						({ user_id }) => !containMatch(usersWhoAreReady, user_id)
// 					);
// 					kickUsers(io, usersWhoWillBeKicked);
// 				}
// 			}
// 		}, KICK_WAIT_TIME_IN_MILLIS);
// 	}
// }

// ================
// = Spotify Like =
// ================
function likeSong(io, socket, data) {
  helpers.likeSong(data);
}

// =========================
// = Spotify set device id =
// =========================
async function setDeviceId(io, socket, data) {
  lobby.setDeviceId(socket.id, data);
}

function forceAlbum(io, socket, { user, addedToQueue }) {
  const lobbyRef = lobby.getLobbyById(user.lobby_id);
  io.to(user.lobby_id).emit("deactivateButtons");
  setLobbyToLoading(io, user.lobby_id);

  // Check if first time a song/album is added to the queue
  let firstSong;
  if (lobbyRef.queue.length === 0) {
    firstSong = true;
  }

  const albumHold = lobby.getAndRemoveHold(user.lobby_id);
  lobby.addAlbumToLobby(user.lobby_id, albumHold);
  io.to(user.lobby_id).emit("addSong", lobbyRef.queue);
  io.to(socket.id).emit("addCheck", albumHold.albumId);

  if (firstSong) {
    io.to(user.lobby_id).emit("firstSong", lobbyRef.queue);
  } else {
    setLobbyToNotLoading(user.lobby_id);
    io.to(user.lobby_id).emit("activateButtons");
  }
}

function operatorMessage(io, message, lobby_id) {
  const formattedMessage = helpers.formatMessage("Listening Lobby", message);
  const messages = lobby.addMessageToLobby(formattedMessage, lobby_id);
  io.to(lobby_id).emit("lobbyMessage", messages);
}

// =================
// = Artist Search =
// =================
async function artistSearch(io, socket, data) {
  let searchResults = await helpers.uniSearch(
    data,
    ARTIST_SEARCH_RESULTS_AMOUNT
  );
  const formattedResults = helpers.formatUniSearchResults(searchResults, data);
  io.to(socket.id).emit("uniSearchResults", formattedResults);
}
function handleShuffle(io, { user }) {
  let shuffleMode = lobby.setShuffleMode(user.lobby_id);
  io.to(user.lobby_id).emit("shuffleToggled", shuffleMode);
  operatorMessage(
    io,
    `${user.username} turned shuffle mode ${shuffleMode ? "on" : "off"}.`,
    user.lobby_id
  );
}

module.exports = {
  joinLobby,
  disconnect,
  lobbyMessage,
  search,
  addSong,
  addAlbum,
  play,
  skip,
  playerData,
  mediaChange,
  remove,
  userReady,
  likeSong,
  setDeviceId,
  forceAlbum,
  artistSearch,
  handleShuffle,
};
