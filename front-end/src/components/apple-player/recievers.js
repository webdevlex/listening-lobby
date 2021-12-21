import * as handlers from './handlers.js';
export function setupSocketRecievers(
	applePlayer,
	socket,
	user,
	setPlaying,
	playerStatus,
	queue,
	setPercent,
	setCurrentTime
) {
	handlers.startUp(applePlayer, socket, user, playerStatus, queue, setPlaying);

	socket.on('getPlayerData', (memberId) => {
		handlers.handleGetPlayerData(applePlayer, memberId, user, socket);
	});
	socket.on('play', (song) => {
		handlers.handlePlay(
			applePlayer,
			socket,
			user,
			setPlaying,
			song,
			setPercent,
			setCurrentTime
		);
	});
	socket.on('pause', (song) => {
		handlers.handlePause(applePlayer, socket, user, setPlaying, song);
	});
	socket.on('firstSong', (queue) => {
		handlers.handleFirstSong(applePlayer, queue[0], socket, user);
	});
	socket.on('popped', (queue) => {
		handlers.handlePopped(
			applePlayer,
			socket,
			queue[0],
			user,
			setPlaying,
			setPercent,
			setCurrentTime
		);
	});
	socket.on('emptyQueue', () => {
		handlers.handleEmptyQueue(
			applePlayer,
			socket,
			user,
			setPlaying,
			setPercent,
			setCurrentTime
		);
	});
	socket.on('removeFirst', (queue, isPlaying) => {
		handlers.handleRemoveFirst(
			applePlayer,
			socket,
			user,
			setPlaying,
			queue[0],
			isPlaying,
			setPercent,
			setCurrentTime
		);
	});
}
