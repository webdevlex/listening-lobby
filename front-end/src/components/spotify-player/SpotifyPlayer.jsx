import React, { useEffect, useContext, useState } from 'react';
import { setupPlayer } from './playerSetup';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';

function SpotifyPlayer({
	user,
	queue,
	playerStatus,
	setLoading,
	buttonsClickable,
	loading,
}) {
	const [socket] = useContext(SocketContext);
	const { spotify, spotifyRan } = useContext(PlayersContext);
	const [spotifyPlayer, setSpotifyPlayer] = spotify;
	const [playing, setPlaying] = useState(false);
	const [ran, setRan] = spotifyRan;

	useEffect(() => {
		if (!ran) {
			setRan(true);
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
		ran,
		setRan,
	]);

	async function play() {
		socket.emit('play', { user });
	}

	function skip() {
		socket.emit('skip', { user });
	}

	return loading ? null : (
		<div>
			{buttonsClickable ? (
				<button onClick={() => play()}>
					<p>{playing ? 'PAUSE' : 'PLAY'}</p>
				</button>
			) : (
				<p>loading</p>
			)}
			{buttonsClickable ? (
				<button onClick={() => skip()}>
					<p>SKIP</p>
				</button>
			) : (
				<p>loading</p>
			)}
		</div>
	);
}

export default SpotifyPlayer;
