import React, { useEffect, useContext } from 'react';
import { setupPlayer } from './playerSetup';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faPlay,
	faPause,
	faStepBackward,
	faStepForward,
} from '@fortawesome/free-solid-svg-icons';
import './spotify-player.scss';

function SpotifyPlayer({
	user,
	queue,
	playerStatus,
	setLoading,
	buttonsClickable,
	loading,
	setPlaying,
	playing,
}) {
	const [socket] = useContext(SocketContext);
	const { spotify, spotifyRan } = useContext(PlayersContext);
	const [spotifyPlayer, setSpotifyPlayer] = spotify;

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
		<div className='player-bar'>
			<div className='player-center'>
				{buttonsClickable ? (
					<>
						<div className='player-controls'>
							<FontAwesomeIcon className='action-icon' icon={faStepBackward} />
							<button className='play-button' onClick={() => play()}>
								{playing ? (
									<FontAwesomeIcon className='action-icon' icon={faPause} />
								) : (
									<FontAwesomeIcon className='action-icon' icon={faPlay} />
								)}
							</button>
							<FontAwesomeIcon
								className='action-icon'
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
		</div>
	);
}

export default SpotifyPlayer;
