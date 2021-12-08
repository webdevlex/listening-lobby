import React, { useEffect, useContext, useState } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';
import './apple-player.scss';
import { setupSocketRecievers } from '../apple-player/recievers';

function ApplePlayer({ lobby_id, playerStatus, queue, buttonsClickable }) {
	const [volume, setVolume] = useState(10);
	const [socket] = useContext(SocketContext);
	const { apple } = useContext(PlayersContext);
	const [applePlayer] = apple;
	const [playing, setPlaying] = useState(false);
	const [ran, setRan] = useState(false);

	useEffect(() => {
		if (!ran) {
			setupSocketRecievers(
				applePlayer,
				socket,
				lobby_id,
				setPlaying,
				playerStatus,
				queue
			);
			setRan(true);
		}
	}, [applePlayer, lobby_id, playerStatus, queue, ran, setRan, socket]);

	//Emits play to all users
	let play = () => {
		socket.emit('play', { lobby_id });
	};

	// TEMP PLAYER CONTROLS --- FOR TESTING
	let nextSong = async () => {
		await applePlayer.authorize();
		socket.emit('skip', { lobby_id });
		// await applePlayer.skipToNextItem();
	};
	let getInstance = async () => {
		console.log(applePlayer);
	};

	let updateVolume = (e, data) => {
		applePlayer.player.volume = e.target.value / 100;
		setVolume(data);
	};

	// TEMP PLAYER CONTROLS --- FOR TESTING

	return (
		<div className='apple-player'>
			<div>
				{buttonsClickable ? (
					<button onClick={() => play()}>
						<p>{playing ? 'PAUSE' : 'PLAY'}</p>
					</button>
				) : (
					<p>loading</p>
				)}
				{buttonsClickable ? (
					<button onClick={() => nextSong()}>Next</button>
				) : (
					<p>loading</p>
				)}

				<button onClick={() => getInstance()}>Get Instance</button>

				<input
					className='volume-slider'
					type='range'
					min='0'
					max='100'
					value={volume}
					onChange={updateVolume}
				/>
			</div>
		</div>
	);
}

export default ApplePlayer;
