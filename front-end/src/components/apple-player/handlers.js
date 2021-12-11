//Adds and removes event listeners
let removeEventListener = (applePlayer) => {
	applePlayer.removeEventListener('mediaItemDidChange', () => {});
};
let addEventListener = (applePlayer, socket, user, toAdd) => {
	applePlayer.addEventListener('mediaItemDidChange', () => {
		socket.emit('mediaChange', { user });
	});
	if (toAdd) {
		applePlayer.player.addEventListener('playbackStateDidChange', () => {
			if (applePlayer.player.playbackState === 10) {
				socket.emit('mediaChange', { user });
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
	if (playerStatus && queue.length > 0) {
		await setMusicKitQueue(applePlayer, queue[0].apple);
		timeStampOnJoin = playerStatus.timestamp / 1000;
		if (!playerStatus.paused) {
			await handlePlay(applePlayer, socket, user, setPlaying);
			await applePlayer.seekToTime(timeStampOnJoin);
			setPlaying(true);
		} else {
			joinOnPause = true;
			socket.emit('userReady', { user });
		}
	} else if (!user.admin) {
		socket.emit('userReady', { user });
	}
}
//Sends other players playerData
export function handleGetPlayerData(
	applePlayer,
	memberId,
	{ lobby_id },
	socket
) {
	socket.emit('playerData', {
		paused: !applePlayer.player.isPlaying,
		timestamp: applePlayer.player.currentPlaybackTime * 1000,
		lobby_id,
		memberId,
	});
}

//Handles play
export async function handlePlay(applePlayer, socket, user, setPlaying) {
	await applePlayer.authorize();
	removeEventListener(applePlayer);
	await applePlayer.play();

	if (joinOnPause) {
		await applePlayer.seekToTime(timeStampOnJoin);
		joinOnPause = false;
	}
	setPlaying(true);
	emitReadyWhenPlaying(socket, applePlayer, user);
	addEventListener(applePlayer, socket, user, false);
}

//Handles pause
export async function handlePause(applePlayer, socket, user, setPlaying) {
	await applePlayer.authorize();
	removeEventListener(applePlayer);
	await applePlayer.pause();
	setPlaying(false);
	emitReadyWhenPaused(socket, applePlayer, user);
	addEventListener(applePlayer, socket, user, false);
}

//Handles first song add
export async function handleFirstSong(applePlayer, queue, socket, user) {
	await setMusicKitQueue(applePlayer, queue[0].apple);
	emitReadyWhenQueueSet(socket, applePlayer, user);
}

//Handles popping
export async function handlePopped(
	applePlayer,
	socket,
	queue,
	user,
	setPlaying
) {
	await setMusicKitQueue(applePlayer, queue[0].apple);
	handlePlay(applePlayer, socket, user, setPlaying);
}
//Handles empty queue
export async function handleEmptyQueue(applePlayer, socket, user, setPlaying) {
	handlePause(applePlayer, socket, user, setPlaying);
}

export async function handleRemoveFirst(
	applePlayer,
	socket,
	user,
	setPlaying,
	newQueue,
	isPlaying
) {
	await setMusicKitQueue(applePlayer, newQueue[0].apple);
	if (isPlaying) {
		handlePlay(applePlayer, socket, user, setPlaying);
	} else {
		handlePause(applePlayer, socket, user, setPlaying);
	}
}

// Ready emitters
function emitReadyWhenPlaying(socket, applePlayer, user) {
	console.log(applePlayer);
	socket.emit('userReady', { user });
}

function emitReadyWhenPaused(socket, applePlayer, user) {
	socket.emit('userReady', { user });
}

function emitReadyWhenQueueSet(socket, applePlayer, user) {
	socket.emit('userReady', { user });
}
