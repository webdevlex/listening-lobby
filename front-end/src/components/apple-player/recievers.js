import * as handlers from './handlers.js';
export function setupSocketRecievers(
	applePlayer,
	socket,
	user,
	setPlaying,
	playerStatus,
	queue
) {
	handlers.startUp(applePlayer, socket, user, playerStatus, queue, setPlaying);

	socket.on('getPlayerData', (memberId) => {
		handlers.handleGetPlayerData(applePlayer, memberId, user, socket);
	});
	socket.on('play', () => {
		handlers.handlePlay(applePlayer, socket, user, setPlaying);
	});
	socket.on('pause', () => {
		handlers.handlePause(applePlayer, socket, user, setPlaying);
	});
	socket.on('firstSong', (queue) => {
		handlers.handleFirstSong(applePlayer, queue, socket, user);
	});
	socket.on('popped', (queue) => {
		handlers.handlePopped(applePlayer, socket, queue, user, setPlaying);
	});
	socket.on('emptyQueue', () => {
		handlers.handleEmptyQueue(applePlayer, socket, user, setPlaying);
	});
	socket.on('removeFirst', (newQueue, isPlaying) => {
		handlers.handleRemoveFirst(
			applePlayer,
			socket,
			user,
			setPlaying,
			newQueue,
			isPlaying
		);
	});
}
