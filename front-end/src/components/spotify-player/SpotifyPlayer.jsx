import React, { useEffect, useContext } from 'react';
import { setupSpotifyPlayer } from './spotifyPlayerSetup';
import { SocketContext } from '../../context/SocketContext';

function SpotifyPlayer({ lobby_id }) {
	const [socket] = useContext(SocketContext);

	useEffect(() => {
		setupSpotifyPlayer();
	}, []);

	function playSong() {
		socket.emit('playSong', lobby_id);
	}

	return (
		<div>
			<button onClick={() => playSong()}>play</button>
		</div>
	);
}

export default SpotifyPlayer;
