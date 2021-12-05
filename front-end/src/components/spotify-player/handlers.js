import {
	setupPlaybackForFirst,
	setListener,
	setupNextSong,
	removeFirstSong,
} from './helper.js';

export async function emptyQueue(socket, spotifyPlayer) {
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
				clearInterval(interval);
			}
		}, 500);
	} else {
		console.log('Not playing on browser');
	}
}

export async function play(socket, spotifyPlayer) {
	const playingOnBrowser = await spotifyPlayer.getCurrentState();
	if (playingOnBrowser) {
		await spotifyPlayer.resume();
	} else {
		socket.emit('setPlayback');
	}
}

export async function pause(socket, spotifyPlayer) {
	const playingOnBrowser = await spotifyPlayer.getCurrentState();
	if (playingOnBrowser) {
		await spotifyPlayer.pause();
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
		console.log('Not playing on browser');
	}
}

export async function firstSong(socket, spotifyPlayer, device_id, queue, user) {
	setupPlaybackForFirst(socket, spotifyPlayer, device_id, queue, user);
}

export async function popped(socket, spotifyPlayer, device_id, queue, user) {
	setupNextSong(device_id, queue, user);
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
