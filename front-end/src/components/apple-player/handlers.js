//Adds and removes event listeners
let appleIsPlaying = false;
let addEventListener = (applePlayer, socket, user) => {
  applePlayer.addEventListener("playbackStateDidChange", () => {
    if (applePlayer.playbackState === 10) {
      appleIsPlaying = false;
      socket.emit("mediaChange", { user });
    } else if (
      applePlayer.playbackState === 3 &&
      appleIsPlaying &&
      applePlayer.currentPlaybackTimeRemaining &&
      applePlayer.currentPlaybackProgress
    ) {
      localStorage.setItem("playback", JSON.stringify({ changed: true }));
      window.location.replace("http://localhost:3000");
    } else if (applePlayer.playbackState === 3) {
      appleIsPlaying = false;
    }
  });
};

//Variables for joining lobby
let timeStampOnJoin = 0;
let joinOnPause = false;

//Helpers
//Sets musicQueue
async function setMusicKitQueue(applePlayer, id) {
  await applePlayer.authorize();
  appleIsPlaying = false;
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
  setPlaying,
  setPercent,
  setCurrentTime
) {
  console.log(applePlayer);
  applePlayer.bitrate = 128;
  addEventListener(applePlayer, socket, user);
  applePlayer.volume = 0.1;
  if (playerStatus && queue.length > 0 && queue[0].apple !== "-1") {
    await setMusicKitQueue(applePlayer, queue[0].apple);
    timeStampOnJoin = playerStatus.timestamp / 1000;
    if (!playerStatus.paused) {
      await handlePlay(
        applePlayer,
        socket,
        user,
        setPlaying,
        queue[0],
        setPercent,
        setCurrentTime
      );
      await applePlayer.seekToTime(timeStampOnJoin);
      setPlaying(true);
    } else {
      joinOnPause = true;
      socket.emit("userReady", { user });
    }
  } else if (!user.admin) {
    socket.emit("userReady", { user });
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
    paused: !applePlayer.isPlaying,
    timestamp: applePlayer.currentPlaybackTime * 1000,
    lobby_id,
    memberId,
  });
}

//Handles play
export async function handlePlay(
  applePlayer,
  socket,
  user,
  setPlaying,
  song,
  setPercent,
  setCurrentTime
) {
  await applePlayer.authorize();
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
  appleIsPlaying = true;
  moveTimeStamp(song, setPercent, setCurrentTime);
  setPlaying(true);
}

//Handles pause
export async function handlePause(applePlayer, socket, user, setPlaying, song) {
  await applePlayer.authorize();

  if (song.apple !== "-1") {
    appleIsPlaying = false;
    await applePlayer.pause();
    emitReadyWhenPaused(socket, applePlayer, user);
  } else {
    emitUserReady(socket, user);
  }

  pauseTimeStamp();
  setPlaying(false);
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
  setPlaying,
  setPercent,
  setCurrentTime
) {
  appleIsPlaying = false;
  resetTimeStamp(setPercent, setCurrentTime);
  pauseTimeStamp(setPercent, setCurrentTime);
  if (song.apple !== "-1") {
    await setMusicKitQueue(applePlayer, song.apple);
    handlePlay(
      applePlayer,
      socket,
      user,
      setPlaying,
      song,
      setPercent,
      setCurrentTime
    );
  } else {
    handlePause(applePlayer, socket, user, setPlaying, song);
  }
}
//Handles empty queue
export async function handleEmptyQueue(
  applePlayer,
  socket,
  user,
  setPlaying,
  setPercent,
  setCurrentTime
) {
  appleIsPlaying = false;
  await applePlayer.pause();
  resetTimeStamp(setPercent, setCurrentTime);
  pauseTimeStamp();
  emitUserReady(socket, user);
  setPlaying(false);
}

export async function handleRemoveFirst(
  applePlayer,
  socket,
  user,
  setPlaying,
  song,
  isPlaying,
  setPercent,
  setCurrentTime
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
      pauseTimeStamp();
      await handlePause();
      setPlaying(true);
    } else {
      setPlaying(false);
    }
    emitUserReady(socket, user);
  }
  resetTimeStamp(setPercent, setCurrentTime);
}

// Ready emitters
function emitReadyWhenPlaying(socket, applePlayer, user) {
  delay(() => socket.emit("userReady", { user }));
}

function emitReadyWhenPaused(socket, applePlayer, user) {
  delay(() => socket.emit("userReady", { user }));
}

function emitReadyWhenQueueSet(socket, applePlayer, user) {
  delay(() => socket.emit("userReady", { user }));
}

function emitUserReady(socket, user) {
  delay(() => socket.emit("userReady", { user }));
}

function delay(func) {
  setTimeout(() => {
    func();
  }, 500);
}

// Timestamp
let currentTime = 0;
let percent = 0;
let interval = null;
function moveTimeStamp(song, setPercent, setCurrentTime) {
  let INTERVAL = song.ui.duration / 100;
  if (!interval) {
    interval = setInterval(() => {
      if (percent < 100) {
        percent += 1;
        currentTime += INTERVAL;
        setCurrentTime(currentTime);
        setPercent(percent);
      }
    }, INTERVAL);
  }
}

function pauseTimeStamp() {
  clearInterval(interval);
  interval = null;
}

function resetTimeStamp(setPercent, setCurrentTime) {
  currentTime = 0;
  percent = 0;
  setPercent(0);
  setCurrentTime(0);
}
