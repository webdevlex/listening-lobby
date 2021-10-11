/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = ''; // Your client id
var client_secret = ''; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
	var text = '';
	var possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(
			Math.floor(Math.random() * possible.length)
		);
	}
	return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

// Set up our server
app
	.use(express.static(__dirname + '/public'))
	.use(cors())
	.use(cookieParser());

// Hitting this end point will redirect user to login
app.get('/login', function (req, res) {
	var state = generateRandomString(16);
	res.cookie(stateKey, state); // attach a cookie to my response that will get sent to user storing the state

	// your application requests authorization to information in "scope" by sending a response to user that will redirect them (cookie attached)
	var scope =
		'user-read-private user-read-email streaming user-read-playback-state user-read-currently-playing';
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: client_id,
				scope: scope,
				redirect_uri: redirect_uri,
				state: state,
			})
	);
});

// After user logs in they will be redirected to url specified by redirect_uri and spotify will send us a req
app.get('/callback', function (req, res) {
	// your application requests refresh and access tokens
	// after checking the state parameter

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	// If there is no state in the request or it doesnt match the one stored in the cookies then no access
	if (state === null || state !== storedState) {
		res.redirect(
			'http://localhost:3000/state-mismatch' +
				querystring.stringify({
					error: 'state_mismatch',
				})
		);
	} else {
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code',
			},
			headers: {
				Authorization:
					'Basic ' +
					new Buffer(client_id + ':' + client_secret).toString(
						'base64'
					),
			},
			json: true,
		};

		request.post(authOptions, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token,
					refresh_token = body.refresh_token;

				// use the access token to access the Spotify Web API
				// var options = {
				// 	url: 'https://api.spotify.com/v1/me',
				// 	headers: { Authorization: 'Bearer ' + access_token },
				// 	json: true,
				// };

				// request.get(options, function (error, response, body) {
				// 	console.log(body);
				// });

				// we can also pass the token to the front end to make requests from there
				res.redirect(
					'http://localhost:3000/logged-in?' +
						querystring.stringify({
							access_token: access_token,
							refresh_token: refresh_token,
						})
				);
			} else {
				res.redirect(
					'http://localhost:3000/invalid-token' +
						querystring.stringify({
							error: 'invalid_token',
						})
				);
			}
		});
	}
});

app.get('/refresh_token', function (req, res) {
	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token;
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: {
			Authorization:
				'Basic ' +
				new Buffer(client_id + ':' + client_secret).toString(
					'base64'
				),
		},
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token,
		},
		json: true,
	};

	request.post(authOptions, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			var access_token = body.access_token;
			res.send({
				access_token: access_token,
			});
		}
	});
});

console.log('Listening on 8888');
app.listen(8888);
