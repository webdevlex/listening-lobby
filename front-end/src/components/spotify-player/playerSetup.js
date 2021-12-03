import { setupSocketRecievers } from './recievers.js';
import { setupPlayback } from './helper.js';

export function setupPlayer(
	socket,
	setSpotifyPlayer,
	user,
	queue,
	playerStatus,
	setLoading
) {
	const params = new URLSearchParams(window.location.search);
	const token = params.get('token');

	const script = document.createElement('script');
	script.src = 'http://sdk.scdn.co/spotify-player.js';
	script.async = true;

	document.body.appendChild(script);

	window.onSpotifyWebPlaybackSDKReady = () => {
		const player = new window.Spotify.Player({
			name: 'Web Playback SDK',
			getOAuthToken: (cb) => {
				cb(token);
			},
			volume: 0.5,
		});

		setSpotifyPlayer(player);
		player.addListener('ready', ({ device_id }) => {
			console.log('ready');
			socket.emit('setDeviceId', { lobby_id: user.lobby_id, device_id });
			setupSocketRecievers(socket, player, user.lobby_id, device_id);
			setupPlayback(
				player,
				device_id,
				playerStatus,
				queue,
				user,
				socket,
				setLoading
			);
		});

		player.connect();
	};
}
