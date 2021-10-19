function socketsHandler(io) {
	io.sockets.on('connection', function (socket) {
		console.log('------------- Someone connected ---------------');
	});
}

module.exports = socketsHandler;
exports = module.exports;
