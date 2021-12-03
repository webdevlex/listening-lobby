import React, { useEffect, useContext, useState } from 'react';
import { setupPlayer } from './playerSetup';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';

function SpotifyPlayer({ user, queue, playerStatus, setLoading }) {
	const [socket] = useContext(SocketContext);
	const { spotify, spotifyRan } = useContext(PlayersContext);
	const [spotifyPlayer, setSpotifyPlayer] = spotify;
	const [playing, setPlaying] = useState(false);
	const [ran, setRan] = spotifyRan;

	useEffect(() => {
		if (!ran) {
			setRan(true);
			console.log('running');
			setupPlayer(
				socket,
				setSpotifyPlayer,
				user,
				queue,
				playerStatus,
				setLoading,
				setPlaying
			);
		}
	}, [
		socket,
		spotifyPlayer,
		setSpotifyPlayer,
		user,
		queue,
		playerStatus,
		setLoading,
		setPlaying,
	]);

	async function play() {
		socket.emit('play', { lobby_id: user.lobby_id });
	}

	function skip() {
		socket.emit('skip', { lobby_id: user.lobby_id });
	}

	return (
		<div>
			<button onClick={() => play()}>
				<p>{playing ? 'PAUSE' : 'PLAY'}</p>
			</button>
			<button onClick={() => skip()}>
				<p>SKIP</p>
			</button>
		</div>
	);
}

export default SpotifyPlayer;
