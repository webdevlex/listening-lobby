const axios = require('axios');
const { response } = require('express');

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

async function search(searchValue, token) {
	const endPoint = '	https://api.spotify.com/v1/search';
	const config = {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + token,
		},
		params: {
			q: `name:${searchValue}`,
			type: 'album,track',
			limit: '10',
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data;
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	playSong,
	search,
};
exports = module.exports;
