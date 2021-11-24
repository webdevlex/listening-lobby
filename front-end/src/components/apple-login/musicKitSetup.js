import axios from 'axios';

export function setUpMusicKit(
	authorized,
	setAuthorized,
	setApplePlayer,
	setAppleToken
) {
	axios
		.get('http://localhost:8888/apple/token')
		.then((res) => {
			const devToken = res.data.token;
			setAppleToken(devToken);
			if (window.MusicKit && !authorized) {
				let configData = {
					developerToken: devToken,
					app: {
						name: 'MusicKit Web App',
						build: '1.0.0',
					},
				};

				const setupMusicKit = new Promise((resolve) => {
					let musicKitInstance = window.MusicKit.configure(configData);
					resolve(musicKitInstance);
				});

				setupMusicKit
					.then((musicKitInstance) => {
						musicKitInstance.authorize();
						setApplePlayer(musicKitInstance);
						setAuthorized(true);
					})
					.catch((error) => {});
			}
		})
		.catch((error) => {});
}
