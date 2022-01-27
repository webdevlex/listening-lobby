const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('config');

const stateKey = 'spotify_auth_state';
const client_id = config.get('client_id');
const client_secret = config.get('client_secret');

const redirect_url =
	process.env.NODE_ENV === 'production'
		? 'www.listeninglobby.com'
		: 'http://localhost:8888';
const redirect_uri = `${redirect_url}/spotify/callback`;

const auth_error_url =
	process.env.NODE_ENV === 'production'
		? 'www.listeninglobby.com'
		: 'http://localhost:3000';

const spotify_scope =
	'user-read-private user-read-email streaming user-read-playback-state user-read-currently-playing playlist-modify-public playlist-modify-private user-library-modify';

var generateRandomString = function (length) {
	var text = '';
	var possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

router.get('/login', function (req, res) {
	const state = generateRandomString(16);
	res.cookie(stateKey, state);

	const urlObj = new URL('https://accounts.spotify.com/authorize');
	urlObj.search = new URLSearchParams({
		response_type: 'code',
		client_id: client_id,
		scope: spotify_scope,
		redirect_uri: redirect_uri,
		state: state,
	});

	res.redirect(urlObj.toString());
});

router.get('/callback', async function (req, res) {
	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		console.log('State mismatch');
		res.redirect(auth_error_url);
	} else {
		const endPoint = 'https://accounts.spotify.com/api/token';

		const body = new URLSearchParams({
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: redirect_uri,
		});

		const config = {
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				Authorization:
					'Basic ' +
					Buffer.from(client_id + ':' + client_secret).toString('base64'),
			},
		};

		try {
			const response = await axios.post(endPoint, body, config);
			const url =
				process.env.NODE_ENV === 'production'
					? 'www.listeninglobby.com/lobby'
					: 'http://localhost:3000/lobby';
			const urlObj = new URL(url);
			urlObj.search = new URLSearchParams({
				token: response.data.access_token,
				refresh_token: response.data.refresh_token,
			});
			res.redirect(urlObj.toString());
		} catch (err) {
			console.log(err);
			res.redirect(auth_error_url);
		}
	}
});

router.get('/refresh_token', async (req, res) => {
	var refresh_token = req.query.refresh_token;

	const endPoint = 'https://accounts.spotify.com/api/token';

	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refresh_token,
	});

	const config = {
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			Authorization:
				'Basic ' +
				Buffer.from(client_id + ':' + client_secret).toString('base64'),
		},
	};

	try {
		const response = await axios.post(endPoint, body, config);
		res.send(response.data.access_token);
	} catch (err) {
		console.log(err);
	}
});

router.get('/temp_token', async function (req, res) {
	const endPoint = 'https://accounts.spotify.com/api/token';

	const body = new URLSearchParams({
		grant_type: 'client_credentials',
	});

	const config = {
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			Authorization:
				'Basic ' +
				Buffer.from(client_id + ':' + client_secret).toString('base64'),
		},
	};

	try {
		const response = await axios.post(endPoint, body, config);
		const token = response.data.access_token;
		res.send(token);
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
