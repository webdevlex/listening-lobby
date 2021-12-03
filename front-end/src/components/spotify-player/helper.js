import axios from 'axios';

export async function setupPlayback(
	player,
	device_id,
	playerStatus,
	queue,
	user,
	socket,
	setLoading
) {
	if (playerStatus && queue.length > 0) {
		console.log('helper');
		// await setPlaybackTo(device_id, user, queue[0], playerStatus);
		// let interval = setInterval(async () => {
		// 	if (await player.getCurrentState()) {
		// 		if (playerStatus.paused) {
		// 			await player.pause();
		// 		}
		// 		clearInterval(interval);
		// 	}
		// }, 500);
		// setListener(socket, player, user);
		// setLoading(false);
	}
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

function setListener(socket, player, user) {
	player.addListener('player_state_changed', (state) => {
		if (
			player.state &&
			state.track_window.previous_tracks.find(
				(x) => x.id === player.state.track_window.current_track.id
			)
		) {
			socket.emit('songEnded', { lobby_id: user.lobby_id });
		}
		player.state = state;
	});
}
