import * as handlers from './handlers.js';

export function setupSocketRecievers(socket, spotifyPlayer, lobby_id) {
	// socket.on('play', () => {
	// 	handlers.play(socket, spotifyPlayer);
	// });

	// socket.on('pause', () => {
	// 	handlers.pause(socket, spotifyPlayer);
	// });

	socket.on('togglePlay', () => {
		console.log('recieved');
		handlers.togglePlay(socket, spotifyPlayer);
	});

	socket.on('skip', () => {
		handlers.skip(socket, spotifyPlayer);
	});

	socket.on('getPlayerData', (memberId) => {
		handlers.getPlayerData(socket, spotifyPlayer, lobby_id, memberId);
	});
}
