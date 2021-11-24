import { setupSocketRecievers } from './recievers.js';

export function setupPlayer(socket, setSpotifyPlayer, lobby_id) {
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

		player.addListener('ready', ({ device_id }) => {
			socket.emit('setDeviceId', { lobby_id, device_id });
			setSpotifyPlayer(player);
			setupSocketRecievers(socket, player, lobby_id);
		});

		player.addListener('player_state_changed', (state) => {
			if (
				state.paused &&
				state.position === 0 &&
				state.restrictions.disallow_resuming_reasons &&
				state.restrictions.disallow_resuming_reasons[0] === 'not_paused'
			) {
				console.log('song ended');
			}
		});

		player.connect();
	};
}
