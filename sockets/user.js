function usingSpotify(userRef) {
	return userRef.music_provider === 'spotify';
}

function usingApple(userRef) {
	return userRef.music_provider === 'apple';
}

module.exports = {
	usingSpotify,
	usingApple,
};
