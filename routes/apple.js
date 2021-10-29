const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');

const authToken = fs.readFileSync('AuthKey_6MU3D8962Y.p8').toString();
const team_id = 'BLSXY36MFR';
const key_id = '6MU3D8962Y';

const token = jwt.sign({}, authToken, {
	algorithm: 'ES256',
	expiresIn: '180d',
	issuer: team_id,
	header: {
		alg: 'ES256',
		kid: key_id,
	},
});

router.get('/token', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ token: token }));
});

module.exports = router;
