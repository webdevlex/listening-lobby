import * as handlers from './handlers.js';

export function setupSocketRecievers(
	socket,
	spotifyPlayer,
	device_id,
	playerStatus,
	queue,
	user,
	setLoading,
	setPlaying
) {
	handlers.setupPlayback(
		spotifyPlayer,
		device_id,
		playerStatus,
		queue,
		user,
		socket,
		setLoading,
		setPlaying
	);

	socket.on('play', () => {
		handlers.play(socket, spotifyPlayer, setPlaying);
	});

	socket.on('pause', () => {
		handlers.pause(socket, spotifyPlayer, setPlaying);
	});

	// socket.on('skip', () => {
	// 	handlers.skip(socket, spotifyPlayer, setPlaying);
	// });

	socket.on('emptyQueue', () => {
		handlers.emptyQueue(socket, spotifyPlayer, setPlaying);
	});

	socket.on('getPlayerData', (memberId) => {
		handlers.getPlayerData(socket, spotifyPlayer, user.lobby_id, memberId);
	});

	socket.on('firstSong', (queue) => {
		handlers.firstSong(socket, spotifyPlayer, device_id, queue, user);
	});

	socket.on('popped', (queue) => {
		handlers.popped(socket, spotifyPlayer, device_id, queue, user, setPlaying);
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
}
