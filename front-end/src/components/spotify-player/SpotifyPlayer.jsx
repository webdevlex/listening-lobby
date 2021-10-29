import React, { useEffect, useContext } from 'react';
import { setupSpotifyPlayer } from './spotifyPlayerSetup';
import { SocketContext } from '../../context/socketContext';

function SpotifyPlayer({ lobby_id }) {
	const socket = useContext(SocketContext);

	useEffect(() => {
		setupSpotifyPlayer();
	}, []);

	function playSong() {
		socket.emit('playSong', lobby_id);
	}

	return <button onClick={() => playSong()}>play</button>;
}

export default SpotifyPlayer;
