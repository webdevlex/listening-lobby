import axios from "axios";

const INTERVAL = 500;
// let lobbyIsPlaying = false;
let poppedRunning = false;

// Listener
function setListener(socket, player, user, setPercent, setCurrentTime, queue) {
  player.addListener("player_state_changed", (state) => {
    if (!state || playbackChanged(state, queue)) {
      kickFromLobby();
    }

    const stateTrack = state.track_window.previous_tracks[0] || { id: -1 };
    if (
      player.state &&
      stateTrack.id === player.state.track_window.current_track.id
    ) {
      socket.emit("mediaChange", { user });
      resetTimeStamp(setPercent, setCurrentTime);
      pauseTimeStamp();
      player.removeListener("player_state_changed");
    }
    player.state = state;
  });
}

function playbackChanged(state, queue) {
  const playbackChangeToAnotherDevice = !state;

  const playersTrackUri = state.track_window.current_track.uri;
  const queuesTrackUri = queue[0].spotify;
  const firstSongAndCurrentlyPlayingDontMatch =
    playersTrackUri !== queuesTrackUri && queuesTrackUri !== "-1";

  return (
    (playbackChangeToAnotherDevice || firstSongAndCurrentlyPlayingDontMatch) &&
    !poppedRunning
  );
}

function kickFromLobby() {
  localStorage.setItem("playback", JSON.stringify({ changed: true }));
  window.location.replace("http://localhost:3000");
}

export async function setupPlayback(
  spotifyPlayer,
  device_id,
  playerStatus,
  queue,
  user,
  socket,
  setLoading,
  setPlaying,
  setPercent,
  setCurrentTime,
  setPlayerActive
) {
  // Make sure player status isnt an empty object
  const validPlayerStatus = Object.keys(playerStatus).length !== 0;
  const songInQueue = queue.length > 0;
  const songAvailableOnSpotify =
    validPlayerStatus && songInQueue ? queue[0].spotify !== "-1" : null;

  if (validPlayerStatus && songInQueue && songAvailableOnSpotify) {
    // Set progress bar offset if some of the song has already been listened to when the user joined
    const songLengthInMillis = queue[0].ui.duration;
    const millisAlreadyElapsed = playerStatus.timestamp;
    moveTimeStamp(
      setPercent,
      setCurrentTime,
      songLengthInMillis,
      millisAlreadyElapsed
    );

    // Set volume to zero so we dont here the song when the playback changes
    const timeBeforeSetQueue = Date.now();
    await setPlaybackTo(device_id, user, queue[0], playerStatus);

    // Wait until the playback actually changes before performing actions
    let interval = setInterval(async () => {
      const playingOnBrowser = await spotifyPlayer.getCurrentState();
      if (playingOnBrowser) {
        setPlayerActive(true);
        await spotifyPlayer.setVolume(0);
        await pauseAndEnsurePlayerPausedThenSetVolumeTo(0.1, spotifyPlayer);

        if (playerStatus.paused) {
          pauseTimeStamp();
          await ensureVolumeNotZeroThenEmitReady(socket, spotifyPlayer, user);
        } else {
          setPlayingTo(true, setPlaying);
          await ensureVolumeNotZeroThenPlayAndEmitReady(
            socket,
            spotifyPlayer,
            user
          );
          const timeAfterSetQueue = Date.now();
          await spotifyPlayer.seek(
            millisAlreadyElapsed + (timeAfterSetQueue - timeBeforeSetQueue)
          );
        }
        clearInterval(interval);
      }
    }, INTERVAL);
    setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime, queue);
  } else if (validPlayerStatus && songInQueue && !songAvailableOnSpotify) {
    const songLengthInMillis = queue[0].ui.duration;
    const millisAlreadyElapsed = playerStatus.timestamp;
    const lobbyPlaying = !playerStatus.paused;

    if (lobbyPlaying) {
      setPlayingTo(true, setPlaying);
      moveTimeStamp(
        setPercent,
        setCurrentTime,
        songLengthInMillis,
        millisAlreadyElapsed
      );
    } else {
      setTimeStamp(
        setPercent,
        setCurrentTime,
        songLengthInMillis,
        millisAlreadyElapsed
      );
    }
    emitUserReady(socket, user);
  }
  // If the person who joined is the admin then the lobby was just created
  // no need to let the backend know the user is ready if the lobby was just created
  else if (!user.admin) {
    emitUserReady(socket, user);
  }

  // Let the user see the lobby once they are fully loaded in
  setLoading(false);
}

export async function play(
  socket,
  spotifyPlayer,
  setPlaying,
  user,
  song,
  setPercent,
  setCurrentTime,
  device_id
) {
  if (song.spotify !== "-1") {
    if (song.newFirstSong) {
      spotifyPlayer.removeListener("player_state_changed");
      await setPlaybackTo(device_id, user, song, { timestamp: 0 });
      setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime, [
        { spotify: song.spotify },
      ]);
    }

    await spotifyPlayer.resume();

    emitReadyWhenPlaying(socket, spotifyPlayer, user);
  } else {
    emitUserReady(socket, user);
  }

  setPlayingTo(true, setPlaying);
  moveTimeStamp(setPercent, setCurrentTime, song.ui.duration);
}

export async function pause(socket, spotifyPlayer, setPlaying, user, song) {
  if (song.spotify !== "-1") {
    await spotifyPlayer.pause();
    setPlayingTo(false, setPlaying);
    emitReadyWhenPaused(socket, spotifyPlayer, user);
  } else {
    setPlayingTo(false, setPlaying);
    emitUserReady(socket, user);
  }
  pauseTimeStamp();
}

export async function emptyQueue(
  socket,
  spotifyPlayer,
  setPlaying,
  user,
  setPercent,
  setCurrentTime
) {
  resetTimeStamp(setPercent, setCurrentTime);
  pauseTimeStamp();
  setPlayingTo(false, setPlaying);
  const playerState = await spotifyPlayer.getCurrentState();

  if (playerState) {
    const volume = await spotifyPlayer.getVolume();
    await spotifyPlayer.setVolume(0);

    let interval = setInterval(async () => {
      const currentStatus = await spotifyPlayer.getCurrentState();
      if (!currentStatus.paused) {
        await spotifyPlayer.pause();
      } else {
        await spotifyPlayer.setVolume(volume);
        ensureVolumeNotZeroThenEmitReady(socket, spotifyPlayer, user);
        clearInterval(interval);
      }
    }, INTERVAL);
  } else {
    emitUserReady(socket, user);
  }
}

export async function getPlayerData(socket, spotifyPlayer, lobby_id, memberId) {
  const playerStatus = await spotifyPlayer.getCurrentState();
  if (playerStatus) {
    socket.emit("playerData", {
      paused: playerStatus.paused,
      timestamp: playerStatus.position,
      lobby_id,
      memberId,
    });
  } else {
    socket.emit("playerData", {
      paused: true,
      timestamp: 0,
      lobby_id,
      memberId,
    });
  }
}

export async function firstSong(
  socket,
  spotifyPlayer,
  device_id,
  queue,
  user,
  setPercent,
  setCurrentTime,
  setPlayerActive
) {
  spotifyPlayer.removeListener("player_state_changed");
  if (queue[0].spotify !== "-1") {
    const volume = await setVolumeToZeroAndGetOldVolume(user, device_id);
    await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });

    let interval = setInterval(async () => {
      if (await spotifyPlayer.getCurrentState()) {
        setPlayerActive(true);
        await pauseAndEnsurePlayerPausedThenSetVolumeTo(volume, spotifyPlayer);
        await ensureVolumeNotZeroThenEmitReady(socket, spotifyPlayer, user);

        clearInterval(interval);
      }
    }, INTERVAL);
  } else {
    emitUserReady(socket, user);
  }
  setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime, queue);
}

export async function setNewFirstSongAndPlay(
  socket,
  spotifyPlayer,
  device_id,
  queue,
  user,
  setPercent,
  setCurrentTime,
  setPlayerActive,
  setPlaying
) {
  spotifyPlayer.removeListener("player_state_changed");
  if (queue[0].spotify !== "-1") {
    const volume = await setVolumeToZeroAndGetOldVolume(user, device_id);
    await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });

    let interval = setInterval(async () => {
      if (await spotifyPlayer.getCurrentState()) {
        setPlayerActive(true);
        await pauseAndEnsurePlayerPausedThenSetVolumeTo(volume, spotifyPlayer);
        // await ensureVolumeNotZeroThenEmitReady(socket, spotifyPlayer, user);

        clearInterval(interval);
      }
    }, INTERVAL);
  }
  // else {
  // 	emitUserReady(socket, user);
  // }
  await play(
    socket,
    spotifyPlayer,
    setPlaying,
    user,
    queue[0],
    setPercent,
    setCurrentTime,
    device_id
  );
  setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime, queue);
}

export async function popped(
  socket,
  spotifyPlayer,
  device_id,
  queue,
  user,
  setPlaying,
  setPercent,
  setCurrentTime
) {
  spotifyPlayer.removeListener("player_state_changed");
  poppedRunning = true;
  resetTimeStamp(setPercent, setCurrentTime);
  if (queue[0].spotify !== "-1") {
    await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });

    emitReadyWhenPlaybackSet(
      socket,
      spotifyPlayer,
      user,
      queue[0],
      setPercent,
      setCurrentTime
    );
  } else {
    const playerStatus = await spotifyPlayer.getCurrentState();
    if (playerStatus && !playerStatus.paused) {
      await spotifyPlayer.pause();
      pauseTimeStamp();
      emitReadyWhenPaused(socket, spotifyPlayer, user);
    } else {
      moveTimeStamp(setPercent, setCurrentTime, queue[0].ui.duration);
      emitUserReady(socket, user);
      poppedRunning = false;
    }
  }
  setPlayingTo(true, setPlaying);
  setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime, queue);
}

// =====================
// = Remove First Song =
// =====================
export async function removeFirst(
  socket,
  spotifyPlayer,
  device_id,
  queue,
  user,
  playing,
  setPercent,
  setCurrentTime
) {
  spotifyPlayer.removeListener("player_state_changed");
  resetTimeStamp(setPercent, setCurrentTime);

  const songAvailableOnSpotify = queue[0].spotify !== "-1";
  if (songAvailableOnSpotify) {
    let volume;
    if (playing) {
      await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });
      emitReadyWhenPlaybackSet(
        socket,
        spotifyPlayer,
        user,
        queue[0],
        setPercent,
        setCurrentTime
      );
    } else {
      pauseTimeStamp();
      volume = await setVolumeToZeroAndGetOldVolume(user, device_id);
      await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });
      await pauseAndEnsurePlayerPausedThenSetVolumeTo(volume, spotifyPlayer);
      await ensureVolumeNotZeroThenEmitReady(socket, spotifyPlayer, user);
    }
  } else {
    const playerStatus = await spotifyPlayer.getCurrentState();
    if (playerStatus && !playerStatus.paused) {
      await spotifyPlayer.pause();
      emitReadyWhenPaused(socket, spotifyPlayer, user);
    } else {
      emitUserReady(socket, user);
    }

    if (playing) {
      moveTimeStamp(setPercent, setCurrentTime, queue[0].ui.duration);
    } else {
      pauseTimeStamp();
    }
  }
  setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime, queue);
}

async function setVolumeToZeroAndGetOldVolume(user, device_id) {
  // Request player data and grab volume
  const deviceData = await getDeviceData(user);
  let { device: { volume_percent = 50 } = {} } = deviceData;

  // Ensure compinsation never makes volume go past 100%
  if (volume_percent >= 100) {
    volume_percent = 99;
  }
  const volume = volume_percent / 100;

  // Send request to set volume to zero
  await setVolume(device_id, user, 0);

  // spotify's set volume endpoint decreases volume by 0.01 so we compinsate for it
  return volume + 0.01;
}

async function pauseAndEnsurePlayerPausedThenSetVolumeTo(
  volume,
  spotifyPlayer
) {
  await pausePlayer(spotifyPlayer);
  await setVolumeAfterPaused(spotifyPlayer, volume);
}

async function setVolumeAfterPaused(spotifyPlayer, volume) {
  let interval = setInterval(async () => {
    const currentStatus = await spotifyPlayer.getCurrentState();
    if (currentStatus.paused) {
      await spotifyPlayer.setVolume(volume);
      clearInterval(interval);
    }
  }, INTERVAL);
}

// =============
// = Endpoints =
// =============
async function setPlaybackTo(device_id, user, song, playerStatus) {
  const endPoint = `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`;

  const body = {
    uris: [song.spotify],
    position_ms: playerStatus.timestamp,
  };

  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };

  try {
    await axios.put(endPoint, body, config);
  } catch (err) {
    // TODO
  }
}

async function setVolume(device_id, user, volume) {
  if (device_id) {
    const endPoint = `https://api.spotify.com/v1/me/player/volume?device_id=${device_id}&volume_percent=${volume}`;

    const config = {
      headers: {
        Accept: "application/json",
        "content-type": "application/json",
        Authorization: "Bearer " + user.token,
      },
    };

    try {
      const res = await axios.put(endPoint, {}, config);
      return res.status;
    } catch (err) {
      console.log(err);
    }
  }
}

async function getDeviceData(user) {
  const endPoint = `https://api.spotify.com/v1/me/player`;

  const config = {
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };

  try {
    const res = await axios.get(endPoint, config);
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

// =============
// = Intervals =
// =============
async function pausePlayer(player) {
  let interval = setInterval(async () => {
    const currentStatus = await player.getCurrentState();
    if (!currentStatus.paused) {
      await player.pause();
    } else {
      clearInterval(interval);
    }
  }, INTERVAL);
}

function emitUserReady(socket, user) {
  socket.emit("userReady", { user });
}

async function ensureVolumeNotZeroThenEmitReady(socket, spotifyPlayer, user) {
  let interval = setInterval(async () => {
    const currentStatus = spotifyPlayer.getCurrentState();
    const playerReady = !currentStatus.loading;

    const localPlayerVolume = await spotifyPlayer.getVolume();

    const playerDataFromEndPoint = await getDeviceData(user);
    const playerVolumeFromEndpoint =
      playerDataFromEndPoint.device.volume_percent;

    const bothVolumesNotZero =
      localPlayerVolume !== 0 && playerVolumeFromEndpoint !== 0;

    if (bothVolumesNotZero && playerReady) {
      emitUserReady(socket, user);
      clearInterval(interval);
    }
  }, INTERVAL);
}

async function ensureVolumeNotZeroThenPlayAndEmitReady(
  socket,
  spotifyPlayer,
  user
) {
  let interval = setInterval(async () => {
    const currentStatus = spotifyPlayer.getCurrentState();
    const playerReady = !currentStatus.loading;

    const localPlayerVolume = await spotifyPlayer.getVolume();

    const playerDataFromEndPoint = await getDeviceData(user);
    const playerVolumeFromEndpoint =
      playerDataFromEndPoint.device.volume_percent;

    const bothVolumesNotZero =
      localPlayerVolume !== 0 && playerVolumeFromEndpoint !== 0;

    if (bothVolumesNotZero && playerReady) {
      keepAttempingPlayUntilPlayingThenEmitReadyWhenPlaying(
        socket,
        spotifyPlayer,
        user
      );
      clearInterval(interval);
    }
  }, INTERVAL);
}

async function keepAttempingPlayUntilPlayingThenEmitReadyWhenPlaying(
  socket,
  spotifyPlayer,
  user
) {
  let interval = setInterval(async () => {
    await spotifyPlayer.resume();
    const currentStatus = await spotifyPlayer.getCurrentState();
    if (!currentStatus.paused && !currentStatus.loading) {
      emitUserReady(socket, user);
      clearInterval(interval);
    }
  }, INTERVAL);
}

async function emitReadyWhenPlaying(socket, spotifyPlayer, user) {
  let interval = setInterval(async () => {
    const currentStatus = await spotifyPlayer.getCurrentState();
    if (!currentStatus.paused && !currentStatus.loading) {
      emitUserReady(socket, user);
      clearInterval(interval);
    }
  }, INTERVAL);
}

async function emitReadyWhenPaused(socket, spotifyPlayer, user) {
  let interval = setInterval(async () => {
    const currentStatus = await spotifyPlayer.getCurrentState();
    if (currentStatus.paused && !currentStatus.loading) {
      emitUserReady(socket, user);
      poppedRunning = false;
      clearInterval(interval);
    }
  }, INTERVAL);
}

async function emitReadyWhenPlaybackSet(
  socket,
  spotifyPlayer,
  user,
  song,
  setPercent,
  setCurrentTime
) {
  let interval = setInterval(async () => {
    const currentStatus = await spotifyPlayer.getCurrentState();
    if (currentStatus && !currentStatus.loading) {
      emitUserReady(socket, user);
      moveTimeStamp(setPercent, setCurrentTime, song.ui.duration);
      poppedRunning = false;
      clearInterval(interval);
    }
  }, INTERVAL);
}

// Timestamp
let currentTime = null;
let percent = null;
let interval = null;

function setTimeStamp(
  setPercent,
  setCurrentTime,
  songLengthInMillis,
  millisAlreadyElapsed = 0
) {
  percent = percent || (millisAlreadyElapsed / songLengthInMillis) * 100;
  currentTime = currentTime || millisAlreadyElapsed;
  setCurrentTime(currentTime);
  setPercent(percent);
}

function moveTimeStamp(
  setPercent,
  setCurrentTime,
  songLengthInMillis,
  millisAlreadyElapsed
) {
  setTimeStamp(
    setPercent,
    setCurrentTime,
    songLengthInMillis,
    millisAlreadyElapsed
  );

  const INTERVAL = songLengthInMillis / 100;
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

function setPlayingTo(value, setPlaying) {
  // lobbyIsPlaying = value;
  setPlaying(value);
}
