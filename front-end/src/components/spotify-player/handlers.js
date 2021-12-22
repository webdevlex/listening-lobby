import axios from 'axios';

const INTERVAL = 500;
let firstPlaybackSet = true;

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
	setPlaybackChangeListener(spotifyPlayer);

	// Make sure player status isnt an empty object
	const validPlayerStatus = Object.keys(playerStatus).length !== 0;

	if (validPlayerStatus && queue.length > 0 && queue[0].spotify !== '-1') {
		// Turn off volume if lobby play status is paused so we dont here the song when the playback changes

		// Switch playback to web player
		await setPlaybackTo(device_id, user, queue[0], playerStatus);

		firstPlaybackSet = false;

		// Wait until the playback actually changes before performing actions
		let interval = setInterval(async () => {
			// Checks if playback is on web player
			if (await spotifyPlayer.getCurrentState()) {
				setPlayerActive(true);
				// Now playing on web player
				// Set initial volume
				setVolumeTo(spotifyPlayer, 0.1);
				// If lobby player status is paused then pause player
				if (playerStatus.paused) {
					// pause player
					pausePlayer(spotifyPlayer);

					// let backend know user is ready when their player is offically paused
					emitReadyWhenPaused(socket, spotifyPlayer, user);
				}
				// If lobby player not paused then just let it play
				else {
					// let UI know whether to display "play" or "pause" button
					setPlaying(true);
					// let backend know the user is ready
					emitUserReady(socket, user);
				}
				// Stop the interval now that all neccessary actions performed
				clearInterval(interval);
			}
		}, INTERVAL);
		// attach listener to player
		setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime);
	}
	// If the person who joined is the admin then the lobby was just created
	// no need to let the backend know the user is ready if the lobby was just created
	else if (!user.admin) {
		emitUserReady(socket, user);
	}

	if (validPlayerStatus && !playerStatus.paused) {
		setPlaying(true);
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
	setCurrentTime
) {
	if (song.spotify !== '-1') {
		setPlaying(true);
		await spotifyPlayer.resume();
		emitReadyWhenPlaying(socket, spotifyPlayer, user);
	} else {
		setPlaying(true);
		emitUserReady(socket, user);
	}
	moveTimeStamp(song, setPercent, setCurrentTime);
}

export async function pause(socket, spotifyPlayer, setPlaying, user, song) {
	if (song.spotify !== '-1') {
		await spotifyPlayer.pause();
		setPlaying(false);
		emitReadyWhenPaused(socket, spotifyPlayer, user);
	} else {
		setPlaying(false);
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
	setPlaying(false);
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
				emitReadyVolumeNotZero(socket, spotifyPlayer, user);
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
		socket.emit('playerData', {
			paused: playerStatus.paused,
			timestamp: playerStatus.position,
			lobby_id,
			memberId,
		});
	} else {
		socket.emit('playerData', {
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
	if (queue[0].spotify !== '-1') {
		let volume = await setVolumeToZero(user, device_id);
		volume = firstPlaybackSet ? 0.1 : volume;
		await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });

		let interval = setInterval(async () => {
			if (await spotifyPlayer.getCurrentState()) {
				setPlayerActive(true);
				pausePlayer(spotifyPlayer);
				setVolumeTo(spotifyPlayer, volume);
				emitReadyVolumeNotZero(socket, spotifyPlayer, user);

				clearInterval(interval);
			}
		}, INTERVAL);
	} else {
		emitUserReady(socket, user);
	}
	setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime);
}

async function setVolumeToZero(user, device_id) {
	const deviceData = await getDeviceData(user);
	const { device: { volume_percent = 50 } = {} } = deviceData;
	const volume = volume_percent / 100;
	await setVolume(device_id, user, 0);
	return volume;
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
	resetTimeStamp(setPercent, setCurrentTime);
	if (queue[0].spotify !== '-1') {
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
		if (!playerStatus.paused) {
			await spotifyPlayer.pause();
			pauseTimeStamp();
			emitReadyWhenPaused(socket, spotifyPlayer, user);
		} else {
			moveTimeStamp(queue[0], setPercent, setCurrentTime);
			emitUserReady(socket, user);
		}
	}
	setPlaying(true);
	setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime);
}

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
	resetTimeStamp(setPercent, setCurrentTime);
	if (queue[0].spotify !== '-1') {
		let volume;
		if (!playing) {
			volume = await setVolumeToZero(user, device_id);
		}

		await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });

		if (!playing) {
			pausePlayer(spotifyPlayer);
			setVolumeTo(spotifyPlayer, volume);
			pauseTimeStamp();
			emitReadyVolumeNotZero(socket, spotifyPlayer, user);
		} else {
			emitReadyWhenPlaybackSet(
				socket,
				spotifyPlayer,
				user,
				queue[0],
				setPercent,
				setCurrentTime
			);
		}
	} else {
		const playerStatus = await spotifyPlayer.getCurrentState();
		if (!playerStatus.paused) {
			await spotifyPlayer.pause();
			emitReadyWhenPaused(socket, spotifyPlayer, user);
		} else {
			emitUserReady(socket, user);
			moveTimeStamp(queue[0], setPercent, setCurrentTime);
		}
	}
	setListener(socket, spotifyPlayer, user, setPercent, setCurrentTime);
}

// Helpers
async function setPlaybackTo(device_id, user, song, playerStatus) {
	const endPoint = `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`;

	const body = {
		uris: [song.spotify],
		position_ms: playerStatus.timestamp,
	};

	const config = {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + user.token,
		},
	};

	try {
		await axios.put(endPoint, body, config);
	} catch (err) {
		// TODO
	}
}

async function setVolume(device_id, user, volume) {
	const endPoint = `https://api.spotify.com/v1/me/player/volume?device_id=${device_id}&volume_percent=${volume}`;

	const config = {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + user.token,
		},
	};

	try {
		await axios.put(endPoint, {}, config);
	} catch (err) {
		console.log(err);
	}
}

async function getDeviceData(user) {
	const endPoint = `https://api.spotify.com/v1/me/player`;

	const config = {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + user.token,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data;
	} catch (err) {
		console.log(err);
	}
}

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

async function setVolumeTo(spotifyPlayer, volume) {
	let interval = setInterval(async () => {
		const currentStatus = await spotifyPlayer.getCurrentState();
		if (currentStatus.paused) {
			await spotifyPlayer.setVolume(volume);
			clearInterval(interval);
		}
	}, INTERVAL);
}

// Listener
function setListener(socket, player, user, setPercent, setCurrentTime) {
	player.addListener('player_state_changed', (state) => {
		const stateTrack = state.track_window.previous_tracks[0] || { id: -1 };
		if (
			player.state &&
			stateTrack.id === player.state.track_window.current_track.id
		) {
			socket.emit('mediaChange', { user });
			resetTimeStamp(setPercent, setCurrentTime);
			pauseTimeStamp();
			player.removeListener('player_state_changed');
		}
		player.state = state;
	});
}

function emitUserReady(socket, user) {
	socket.emit('userReady', { user });
}

async function emitReadyVolumeNotZero(socket, spotifyPlayer, user) {
	let interval = setInterval(async () => {
		const currentStatus = spotifyPlayer.getCurrentState();
		const volume = await spotifyPlayer.getVolume();
		if (volume !== 0 && !currentStatus.loading) {
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
			moveTimeStamp(song, setPercent, setCurrentTime);
			clearInterval(interval);
		}
	}, INTERVAL);
}

function setPlaybackChangeListener(spotifyPlayer) {
	spotifyPlayer.addListener('player_state_changed', (state) => {
		if (!state) {
			localStorage.setItem('playback', JSON.stringify({ changed: true }));
			window.location.replace('http://localhost:3000');
		}
	});
}

// Timestamp
let currentTime = 0;
let percent = 0;
let interval = null;
function moveTimeStamp(song, setPercent, setCurrentTime) {
	const INTERVAL = song.ui.duration / 100;
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
