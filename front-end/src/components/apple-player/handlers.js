//Adds and removes event listeners
let removeEventListener = (applePlayer) => {
  applePlayer.removeEventListener("mediaItemDidChange", () => {});
};
let addEventListener = (applePlayer, socket, user, toAdd) => {
  applePlayer.addEventListener("mediaItemDidChange", () => {
    socket.emit("mediaChange", { user });
  });
  if (toAdd) {
    applePlayer.player.addEventListener("playbackStateDidChange", () => {
      if (applePlayer.player.playbackState === 10) {
        socket.emit("mediaChange", { user });
      }
    });
    applePlayer.player.addEventListener("playbackBitrateDidChange", () => {
      if (applePlayer.bitrate === -1) {
        window.location.replace("http://localhost:3000");
      }
    });
  }
};

//Variables for joining lobby
let timeStampOnJoin = 0;
let joinOnPause = false;

//Helpers
//Sets musicQueue
async function setMusicKitQueue(applePlayer, id) {
  await applePlayer.authorize();
  await applePlayer.setQueue({
    song: id,
  });
}

//Start up function that sets intial values, listeners and catches up to existing
//players
export async function startUp(
  applePlayer,
  socket,
  user,
  playerStatus,
  queue,
  setPlaying
) {
  addEventListener(applePlayer, socket, user, true);
  applePlayer.player.volume = 0.1;
  if (playerStatus && queue.length > 0 && queue[0].apple !== "-1") {
    await setMusicKitQueue(applePlayer, queue[0].apple);
    timeStampOnJoin = playerStatus.timestamp / 1000;
    if (!playerStatus.paused) {
      await handlePlay(applePlayer, socket, user, setPlaying, queue[0]);
      await applePlayer.seekToTime(timeStampOnJoin);
      setPlaying(true);
    } else {
      joinOnPause = true;
      socket.emit("userReady", { user });
    }
  } else if (!user.admin) {
    socket.emit("userReady", { user });
    setPlaying(true);
  }
}
//Sends other players playerData
export function handleGetPlayerData(
  applePlayer,
  memberId,
  { lobby_id },
  socket
) {
  socket.emit("playerData", {
    paused: !applePlayer.player.isPlaying,
    timestamp: applePlayer.player.currentPlaybackTime * 1000,
    lobby_id,
    memberId,
  });
}

//Handles play
export async function handlePlay(applePlayer, socket, user, setPlaying, song) {
  await applePlayer.authorize();
  removeEventListener(applePlayer);
  if (song.apple !== "-1") {
    await applePlayer.play();

    if (joinOnPause) {
      await applePlayer.seekToTime(timeStampOnJoin);
      joinOnPause = false;
    }
    emitReadyWhenPlaying(socket, applePlayer, user);
  } else {
    emitUserReady(socket, user);
  }

  setPlaying(true);
  addEventListener(applePlayer, socket, user, false);
}

//Handles pause
export async function handlePause(applePlayer, socket, user, setPlaying, song) {
  await applePlayer.authorize();
  removeEventListener(applePlayer);

  if (song.apple !== "-1") {
    await applePlayer.pause();
    emitReadyWhenPaused(socket, applePlayer, user);
  } else {
    emitUserReady(socket, user);
  }

  setPlaying(false);
  addEventListener(applePlayer, socket, user, false);
}

//Handles first song add
export async function handleFirstSong(applePlayer, song, socket, user) {
  if (song.apple !== "-1") {
    await setMusicKitQueue(applePlayer, song.apple);
    emitReadyWhenQueueSet(socket, applePlayer, user);
  } else {
    emitUserReady(socket, user);
  }
}

//Handles popping
export async function handlePopped(
  applePlayer,
  socket,
  song,
  user,
  setPlaying
) {
  if (song.apple !== "-1") {
    await setMusicKitQueue(applePlayer, song.apple);
    handlePlay(applePlayer, socket, user, setPlaying, song);
  } else {
    await applePlayer.pause();
    emitUserReady(socket, user);
  }
}
//Handles empty queue
export async function handleEmptyQueue(applePlayer, socket, user, setPlaying) {
  await applePlayer.pause();
  emitUserReady(socket, user);
  setPlaying(false);
}

export async function handleRemoveFirst(
  applePlayer,
  socket,
  user,
  setPlaying,
  song,
  isPlaying
) {
  if (song.apple !== "-1") {
    await setMusicKitQueue(applePlayer, song.apple);
    if (isPlaying) {
      handlePlay(applePlayer, socket, user, setPlaying, song);
    } else {
      handlePause(applePlayer, socket, user, setPlaying, song);
    }
  } else {
    if (isPlaying) {
      await applePlayer.pause();
      setPlaying(true);
    } else {
      setPlaying(false);
    }
    emitUserReady(socket, user);
  }
}

// Ready emitters
function emitReadyWhenPlaying(socket, applePlayer, user) {
  console.log(applePlayer);
  socket.emit("userReady", { user });
}

function emitReadyWhenPaused(socket, applePlayer, user) {
  socket.emit("userReady", { user });
}

function emitReadyWhenQueueSet(socket, applePlayer, user) {
  socket.emit("userReady", { user });
}

function emitUserReady(socket, user) {
  socket.emit("userReady", { user });
}
