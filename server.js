const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app
	.use(express.static(__dirname + '/public'))
	.use(cors())
	.use(cookieParser());

app.use('/spotify', require('./routes/spotify'));

const PORT = process.env.PORT || 8888;
console.log(`Listening on ${PORT}`);
app.listen(PORT);
