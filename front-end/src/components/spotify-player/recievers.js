import * as handlers from './handlers.js';

export function setupSocketRecievers(
	socket,
	spotifyPlayer,
	user,
	device_id,
	setPlaying
) {
	socket.on('emptyQueue', () => {
		setPlaying(false);
		handlers.emptyQueue(socket, spotifyPlayer);
	});

	socket.on('play', () => {
		handlers.play(socket, spotifyPlayer, device_id);
		setPlaying(true);
	});

	socket.on('pause', () => {
		handlers.pause(socket, spotifyPlayer, device_id);
		setPlaying(false);
	});

	socket.on('skip', () => {
		handlers.skip(socket, spotifyPlayer);
	});

	socket.on('getPlayerData', (memberId) => {
		handlers.getPlayerData(socket, spotifyPlayer, user.lobby_id, memberId);
	});

	socket.on('firstSong', (queue) => {
		handlers.firstSong(socket, spotifyPlayer, device_id, queue, user);
	});

	socket.on('removeFirst', (queue, playing) => {
		handlers.removeFirst(
			socket,
			spotifyPlayer,
			device_id,
			queue,
			user,
			playing
		);
	});

	socket.on('popped', (queue) => {
		handlers.popped(socket, spotifyPlayer, device_id, queue, user);
	});
}
