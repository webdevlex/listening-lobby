import * as handlers from './handlers.js';

export function setupSocketRecievers(
	socket,
	spotifyPlayer,
	lobby_id,
	device_id
) {
	// socket.on('play', () => {
	// 	handlers.play(socket, spotifyPlayer);
	// });

	socket.on('pause', () => {
		handlers.pause(socket, spotifyPlayer);
	});

	socket.on('togglePlay', () => {
		handlers.togglePlay(socket, spotifyPlayer, device_id);
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
