import axios from 'axios';

export function setUpMusicKit(
	authorized,
	setAuthorized,
	setMusicKit
) {
	console.log('hello', window.MusicKit);
	axios
		.get('http://localhost:8888/apple/token')
		.then((res) => {
			const devToken = res.data.token;
			if (window.MusicKit && !authorized) {
				let configData = {
					developerToken: devToken,
					app: {
						name: 'MusicKit Web App',
						build: '1.0.0',
					},
				};

				const setupMusicKit = new Promise((resolve) => {
					let musicKitInstance =
						window.MusicKit.configure(configData);
					resolve(musicKitInstance);
				});

				setupMusicKit
					.then((musicKitInstance) => {
						setMusicKit(musicKitInstance);
						setAuthorized(true);
						musicKitInstance.authorize();
					})
					.catch((error) => {});
			}
		})
		.catch((error) => {});
}
