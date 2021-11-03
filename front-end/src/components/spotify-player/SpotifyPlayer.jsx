import React, { useEffect, useContext } from 'react';
import { setupSpotifyPlayer } from './spotifyPlayerSetup';
import { SocketContext } from '../../context/socketContext';
import SpotfiySearch from '../spotify-search/SpotfiySearch';

function SpotifyPlayer({ lobby_id }) {
	const socket = useContext(SocketContext);

	useEffect(() => {
		setupSpotifyPlayer();
	}, []);

	function playSong() {
		socket.emit('playSong', lobby_id);
	}

	return (
		<div>
			<SpotfiySearch />
			<button onClick={() => playSong()}>play</button>
		</div>
	);
}

export default SpotifyPlayer;
