// export async function play(socket, spotifyPlayer) {
// 	const playingOnBrowser = await spotifyPlayer.getCurrentState();
// 	if (playingOnBrowser) {
// 		await spotifyPlayer.resume();
// 	} else {
// 		console.log('Not playing on browser');
// 	}
// }

export async function endOfQueue(socket, spotifyPlayer) {
	const playerState = await spotifyPlayer.getCurrentState();
	if (playerState) {
		const volume = await spotifyPlayer.getVolume();
		console.log(playerState);
		await spotifyPlayer.setVolume(0);
		setTimeout(async () => {
			await spotifyPlayer.pause();
			await spotifyPlayer.setVolume(volume);
		}, 1000);
	} else {
		console.log('Not playing on browser');
	}
}

export async function togglePlay(socket, spotifyPlayer) {
	const playingOnBrowser = await spotifyPlayer.getCurrentState();
	if (playingOnBrowser) {
		await spotifyPlayer.togglePlay();
	} else {
		socket.emit('setPlayback');
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

export async function firstSong(socket, spotifyPlayer) {
	console.log('First song added');
}
