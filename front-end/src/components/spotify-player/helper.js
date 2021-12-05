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

function pausePlayer(player) {
	let interval = setInterval(async () => {
		const currentStatus = await player.getCurrentState();
		if (!currentStatus.paused) {
			await player.pause();
		} else {
			clearInterval(interval);
		}
	}, 500);
}

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

export function setListener(socket, player, user) {
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

export async function setupPlaybackForFirst(
	socket,
	player,
	device_id,
	queue,
	user
) {
	await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });
	let interval = setInterval(async () => {
		if (await player.getCurrentState()) {
			pausePlayer(player);
			clearInterval(interval);
		}
	}, 500);
	setListener(socket, player, user);
}

export async function setupNextSong(device_id, queue, user) {
	await setPlaybackTo(device_id, user, queue[0], { timestamp: 0 });
}
