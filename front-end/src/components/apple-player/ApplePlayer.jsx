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
	faHeart,
} from '@fortawesome/free-solid-svg-icons';

function ApplePlayer({
	user,
	playerStatus,
	queue,
	buttonsClickable,
	loading,
	likedSongs,
	setLikedSongs,
	playing,
	setPlaying,
}) {
	const [volume, setVolume] = useState(10);
	const [socket] = useContext(SocketContext);
	const { apple } = useContext(PlayersContext);
	const [applePlayer] = apple;

	const [ran, setRan] = useState(false);
	const song = queue[0];

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
	}, [applePlayer, user, playerStatus, queue, ran, setRan, socket, setPlaying]);

	//Emits play to all users
	let play = () => {
		socket.emit('play', { user });
	};

	// TEMP PLAYER CONTROLS --- FOR TESTING
	let skip = async () => {
		socket.emit('skip', { user });
		// await applePlayer.skipToNextItem();
	};

	// let getInstance = async () => {
	// 	console.log(applePlayer);
	// };

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

	async function addSongToLibrary(spotifySong, appleSong, id) {
		setLikedSongs([...likedSongs, id]);
		if (user.music_provider === 'apple') {
			await applePlayer.addToLibrary(appleSong);
		} else {
			socket.emit('likeSong', { spotifySong, user });
		}
	}

	return loading ? null : (
		<div className='player-bar'>
			<div className='player-left'>
				{song ? (
					<>
						<div className='album-cover-container'>
							<img className='album-cover' src={song.ui.trackCover} alt='' />
						</div>
						<div className='text'>
							<p className='simple-text track-title'>{song.ui.trackName}</p>
							<p className='simple-text track-artists'>{song.ui.artists}</p>
						</div>
						<FontAwesomeIcon
							className='like-icon'
							icon={faHeart}
							onClick={() => {
								addSongToLibrary(song.spotify, song.apple, song.ui.uniId);
							}}
						/>
					</>
				) : (
					<>
						<div className='album-cover-container'>
							<p className='default-album-cover'>?</p>
						</div>
						<div className='text'>
							<p className='simple-text track-title'>No Songs Added</p>
							<p className='simple-text track-artists'>
								Search and add songs to queue!
							</p>
						</div>
					</>
				)}
			</div>
			<div className='player-center'>
				{buttonsClickable ? (
					<>
						<div className='player-controls'>
							<FontAwesomeIcon className='skip-icon' icon={faStepBackward} />
							<button className='play-button' onClick={() => play()}>
								{playing ? (
									<FontAwesomeIcon className='player-icon' icon={faPause} />
								) : (
									<FontAwesomeIcon className='player-icon' icon={faPlay} />
								)}
							</button>
							<FontAwesomeIcon
								className='skip-icon'
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
