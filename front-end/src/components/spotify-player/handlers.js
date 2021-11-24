// export async function play(socket, spotifyPlayer) {
// 	const playingOnBrowser = await spotifyPlayer.getCurrentState();
// 	if (playingOnBrowser) {
// 		await spotifyPlayer.resume();
// 	} else {
// 		console.log('Not playing on browser');
// 	}
// }

// export async function pause(socket, spotifyPlayer) {
// 	const playingOnBrowser = await spotifyPlayer.getCurrentState();
// 	if (playingOnBrowser) {
// 		await spotifyPlayer.pause();
// 	} else {
// 		console.log('Not playing on browser');
// 	}
// }

export async function togglePlay(socket, spotifyPlayer) {
	const playingOnBrowser = await spotifyPlayer.getCurrentState();
	if (playingOnBrowser) {
		await spotifyPlayer.togglePlay();
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
	const playingOnBrowser = await spotifyPlayer.getCurrentState();
	if (playingOnBrowser) {
		socket.emit('playerData', {
			paused: playingOnBrowser.paused,
			timestamp: playingOnBrowser.position,
			lobby_id,
			memberId,
		});
	} else {
		console.log('Not playing on browser');
	}
}
