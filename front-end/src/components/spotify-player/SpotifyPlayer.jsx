import React, { useEffect, useContext } from 'react';
import { setupPlayer } from './playerSetup';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';

function SpotifyPlayer({ lobby_id }) {
	const [socket] = useContext(SocketContext);
	const { spotify } = useContext(PlayersContext);
	const [spotifyPlayer, setSpotifyPlayer] = spotify;

	useEffect(() => {
		if (!spotifyPlayer) {
			setupPlayer(socket, setSpotifyPlayer, lobby_id);
		}
	}, [socket, spotifyPlayer, setSpotifyPlayer, lobby_id]);

	async function play() {
		socket.emit('togglePlay', { lobby_id });
	}

	function skip() {
		socket.emit('skip', { lobby_id });
	}

	return (
		<div>
			<button onClick={() => play()}>
				<p>PLAY</p>
			</button>
			<button onClick={() => skip()}>
				<p>SKIP</p>
			</button>
		</div>
	);
}

export default SpotifyPlayer;
