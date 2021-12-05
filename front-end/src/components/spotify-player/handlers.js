import axios from 'axios';

export async function setupPlayback(
	player,
	device_id,
	playerStatus,
	queue,
	user,
	socket,
	setLoading,
	setPlaying
) {
	if (playerStatus && queue.length > 0) {
		await setPlaybackTo(device_id, user, queue[0], playerStatus);

		let interval = setInterval(async () => {
			if (await player.getCurrentState()) {
				if (playerStatus.paused) {
					pausePlayer(player);
				} else {
					setPlaying(true);
				}
				clearInterval(interval);
			}
		}, 500);
		setListener(socket, player, user);
	}
	setLoading(false);
}

export async function play(socket, spotifyPlayer, setPlaying) {
	const playingOnBrowser = await spotifyPlayer.getCurrentState();
	if (playingOnBrowser) {
		await spotifyPlayer.resume();
		setPlaying(true);
	} else {
		socket.emit('setPlayback');
	}
}

export async function pause(socket, spotifyPlayer, setPlaying) {
	const playingOnBrowser = await spotifyPlayer.getCurrentState();
	if (playingOnBrowser) {
		await spotifyPlayer.pause();
		setPlaying(false);
	} else {
		console.log('Not playing on browser');
	}
}

export async function skip(socket, spotifyPlayer) {
	const playingOnBrowser = await spotifyPlayer.getCurrentState();
	if (playingOnBrowser) {
		await spotifyPlayer.nextTrack();
	} else {
		console.log('Not playing on browser');
	}
}

export async function emptyQueue(socket, spotifyPlayer, setPlaying) {
	const playerState = await spotifyPlayer.getCurrentState();

	if (playerState) {
		const volume = await spotifyPlayer.getVolume();
		await spotifyPlayer.setVolume(0);

		let interval = setInterval(async () => {
			const currentStatus = await spotifyPlayer.getCurrentState();
			if (!currentStatus.paused) {
				await spotifyPlayer.pause();
			} else {
				setPlaying(false);
				await spotifyPlayer.setVolume(volume);
				clearInterval(interval);
			}
		}, 500);
	} else {
		console.log('Not playing on browser');
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

export async function firstSong(socket, spotifyPlayer, device_id, queue, user) {
	await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });
	let interval = setInterval(async () => {
		if (await spotifyPlayer.getCurrentState()) {
			pausePlayer(spotifyPlayer);
			clearInterval(interval);
		}
	}, 500);
	setListener(socket, spotifyPlayer, user);
}

export async function popped(socket, spotifyPlayer, device_id, queue, user) {
	await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });
	setListener(socket, spotifyPlayer, user);
}

export async function removeFirst(
	socket,
	spotifyPlayer,
	device_id,
	queue,
	user,
	playing
) {
	removeFirstSong(spotifyPlayer, device_id, queue, user, playing);
	setListener(socket, spotifyPlayer, user);
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
		console.log(err);
	}
}

export async function pausePlayer(player) {
	let interval = setInterval(async () => {
		const currentStatus = await player.getCurrentState();
		if (!currentStatus.paused) {
			await player.pause();
		} else {
			clearInterval(interval);
		}
	}, 500);
}

function setListener(socket, player, user) {
	player.addListener('player_state_changed', (state) => {
		const stateTrack = state.track_window.previous_tracks[0] || { id: -1 };
		if (
			player.state &&
			stateTrack.id === player.state.track_window.current_track.id
		) {
			socket.emit('mediaChange', { lobby_id: user.lobby_id });
			player.removeListener('player_state_changed');
		}
		player.state = state;
	});
}

async function removeFirstSong(player, device_id, queue, user, playing) {
	await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });
	if (!playing) {
		pausePlayer(player);
	}
}
