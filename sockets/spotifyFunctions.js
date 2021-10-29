const axios = require('axios');

function playSong(token) {
	axios
		.put(
			'https://api.spotify.com/v1/me/player/play',
			{},
			{
				headers: {
					Accept: 'application/json',
					'content-type': 'application/json',
					Authorization: 'Bearer ' + token,
				},
			}
		)
		.then((response) => {
			// console.log('Player Started!');
		})
		.catch((error) => {
			// console.log('Player start failed...');
		});
}

module.exports = {
	playSong,
};
exports = module.exports;
