import * as handlers from './handlers.js';

export function setupSocketRecievers(
	socket,
	spotifyPlayer,
	device_id,
	playerStatus,
	queue,
	user,
	setLoading,
	setPlaying,
	setPercent,
	setCurrentTime,
	setPlayerActive
) {
	handlers.setupPlayback(
		spotifyPlayer,
		device_id,
		playerStatus,
		queue,
		user,
		socket,
		setLoading,
		setPlaying,
		setPercent,
		setCurrentTime,
		setPlayerActive
	);

	socket.on('play', (song) => {
		handlers.play(
			socket,
			spotifyPlayer,
			setPlaying,
			user,
			song,
			setPercent,
			setCurrentTime
		);
	});

	socket.on('pause', (song) => {
		handlers.pause(socket, spotifyPlayer, setPlaying, user, song);
	});

	socket.on('emptyQueue', () => {
		handlers.emptyQueue(
			socket,
			spotifyPlayer,
			setPlaying,
			user,
			setPercent,
			setCurrentTime
		);
	});

	socket.on('getPlayerData', (memberId) => {
		handlers.getPlayerData(socket, spotifyPlayer, user.lobby_id, memberId);
	});

	socket.on('firstSong', (queue) => {
		handlers.firstSong(
			socket,
			spotifyPlayer,
			device_id,
			queue,
			user,
			setPercent,
			setCurrentTime,
			setPlayerActive
		);
	});

	socket.on('popped', (queue) => {
		handlers.popped(
			socket,
			spotifyPlayer,
			device_id,
			queue,
			user,
			setPlaying,
			setPercent,
			setCurrentTime
		);
	});

	socket.on('removeFirst', (queue, playing) => {
		handlers.removeFirst(
			socket,
			spotifyPlayer,
			device_id,
			queue,
			user,
			playing,
			setPercent,
			setCurrentTime
		);
	});
}
