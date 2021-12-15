import React, { useEffect, useContext, useState } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';
import './apple-player.scss';
import { setupSocketRecievers } from '../apple-player/recievers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faPlay,
	faPause,
	faStepBackward,
	faStepForward,
	faVolumeUp,
} from '@fortawesome/free-solid-svg-icons';

function ApplePlayer({ user, playerStatus, queue, buttonsClickable, loading }) {
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
				user,
				setPlaying,
				playerStatus,
				queue
			);
			setRan(true);
		}
	}, [applePlayer, user, playerStatus, queue, ran, setRan, socket]);

	//Emits play to all users
	let play = () => {
		socket.emit('play', { user });
	};

	// TEMP PLAYER CONTROLS --- FOR TESTING
	let skip = async () => {
		socket.emit('skip', { user });
		// await applePlayer.skipToNextItem();
	};

	let getInstance = async () => {
		console.log(applePlayer);
	};

	let updateVolume = (e, data) => {
		applePlayer.player.volume = e.target.value / 100;
		setVolume(data);

		// Animation
		let target = e.target;
		if (e.target.type !== 'range') {
			target = document.getElementById('range');
		}
		const min = target.min;
		const max = target.max;
		const val = target.value;

		target.style.backgroundSize = ((val - min) * 100) / (max - min) + '% 100%';
	};

	return loading ? null : (
		<div className='player-bar'>
			<div className='player-center'>
				{buttonsClickable ? (
					<>
						<div className='player-controls'>
							<FontAwesomeIcon
								className='prev-button player-icon'
								icon={faStepBackward}
							/>
							<button className='play-button' onClick={() => play()}>
								{playing ? (
									<FontAwesomeIcon className='player-icon' icon={faPause} />
								) : (
									<FontAwesomeIcon className='player-icon' icon={faPlay} />
								)}
							</button>
							<FontAwesomeIcon
								className='player-icon'
								onClick={() => skip()}
								icon={faStepForward}
							/>
						</div>
					</>
				) : (
					<p>loading</p>
				)}
				<div className='time-bar'></div>
			</div>
			<div className='player-right'>
				{/* <button onClick={() => getInstance()}>Get Instance</button> */}
				<FontAwesomeIcon className='action-icon' icon={faVolumeUp} />
				<input
					className='volume-slider'
					type='range'
					min='0'
					max='100'
					defaultValue={volume}
					onChange={updateVolume}
				/>
			</div>
		</div>
	);
}

export default ApplePlayer;
