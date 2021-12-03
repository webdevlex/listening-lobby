import * as handlers from './handlers.js';

export function setupSocketRecievers(
	socket,
	spotifyPlayer,
	lobby_id,
	device_id,
	setPlaying
) {
	// socket.on('play', () => {
	// 	handlers.play(socket, spotifyPlayer);
	// });

	socket.on('emptyQueue', () => {
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
		handlers.getPlayerData(socket, spotifyPlayer, lobby_id, memberId);
	});

	socket.on('firstSong', () => {
		handlers.firstSong(socket, spotifyPlayer);
	});
}
