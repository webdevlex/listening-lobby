import { setupSocketRecievers } from './recievers.js';

export function playerSetup(
	socket,
	setSpotifyPlayer,
	user,
	queue,
	playerStatus,
	setLoading,
	setPlaying,
	setPercent,
	setCurrentTime,
	setPlayerActive
) {
	const params = new URLSearchParams(window.location.search);
	const token = params.get('token');

	const script = document.createElement('script');
	script.src = 'http://sdk.scdn.co/spotify-player.js';
	script.async = true;

	document.body.appendChild(script);

	window.onSpotifyWebPlaybackSDKReady = () => {
		console.log(token);
		const spotifyPlayer = new window.Spotify.Player({
			name: 'Web Playback SDK',
			getOAuthToken: (cb) => {
				cb(token);
			},
			volume: 0.1,
		});

		spotifyPlayer.addListener('ready', ({ device_id }) => {
			console.log('spotify player ready');
			setSpotifyPlayer(spotifyPlayer);
			console.log('spotify context set', spotifyPlayer);

			socket.emit('setDeviceId', { lobby_id: user.lobby_id, device_id });
			setupSocketRecievers(
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
			);
		});

		spotifyPlayer.connect();
	};
}
