const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketio = require("socket.io");
const reciever = require("./sockets/reciever");
const path = require("path");
const frontEndUrl = "" || "http://localhost:3000";

const app = express();

const whitelist = ["http://localhost:3000", "http://localhost:8888"];
const corsOptions = {
	origin: function (origin, callback) {
		// console.log('** Origin of request ' + origin);
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			// console.log('Origin acceptable');
			callback(null, true);
		} else {
			// console.log('Origin rejected');
			callback(new Error("Not allowed by CORS"));
		}
	},
};
app
	.use(cors())
	.use(cookieParser())
	.use("/spotify", require("./routes/spotify"))
	.use("/apple", require("./routes/apple"));

const server = http.createServer(app);
const ioCors = {
	cors: { origin: frontEndUrl, methods: ["GET", "POST"] },
};
const io = socketio(server, ioCors);
reciever(io);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "front-end/build")));
	app.get("*", function (req, res) {
		res.sendFile(path.join(__dirname, "front-end/build", "index.html"));
	});
}

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
