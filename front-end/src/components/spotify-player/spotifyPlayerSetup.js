import axios from 'axios';

export function setupSpotifyPlayer() {
	const params = new URLSearchParams(window.location.search);
	const token = params.get('token');

	const script = document.createElement('script');
	script.src = 'https://sdk.scdn.co/spotify-player.js';
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

		player.addListener('ready', async ({ device_id }) => {
			await setPlayer(device_id, token);
		});

		player.addListener('not_ready', ({ device_id }) => {
			console.log('Device ID has gone offline', device_id);
		});

		player.connect();
	};
}

async function setPlayer(device_id, token) {
	axios
		.put(
			'https://api.spotify.com/v1/me/player',
			{
				device_ids: [device_id],
			},
			{
				headers: {
					Accept: 'application/json',
					'content-type': 'application/json',
					Authorization: 'Bearer ' + token,
				},
			}
		)
		.then(function (response) {
			// console.log(response);
		})
		.catch(function (error) {
			console.log(error);
		});
}
