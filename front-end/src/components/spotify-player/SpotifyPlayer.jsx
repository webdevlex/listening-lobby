import React, { useEffect, useContext, useState } from 'react';
import { playerSetup } from './playerSetup';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faPlay,
	faPause,
	faStepBackward,
	faStepForward,
	faVolumeUp,
	faHeart,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as heartOutline } from '@fortawesome/free-regular-svg-icons';
import LoadingSpinner from '../loading-spinner/LoadingSpinner';
import './spotify-player.scss';
import TimeBar from '../time-bar/TimeBar';

function SpotifyPlayer({
	user,
	queue,
	playerStatus,
	setLoading,
	buttonsClickable,
	loading,
	setPlaying,
	playing,
	likedSongs,
	setLikedSongs,
	percent,
	setPercent,
	currentTime,
	setCurrentTime,
}) {
	const [socket] = useContext(SocketContext);
	const { spotify, spotifyRan, apple } = useContext(PlayersContext);
	const [spotifyPlayer, setSpotifyPlayer] = spotify;
	const [applePlayer] = apple;
	const [volume, setVolume] = useState(10);
	const [ran, setRan] = spotifyRan;
	const song = queue[0];
	// const [percent, setPercent] = useState(0);
	// const [currentTime, setCurrentTime] = useState(0);
	const [playerActive, setPlayerActive] = useState(false);

	useEffect(() => {
		if (!ran) {
			setRan(true);
			playerSetup(
				socket,
				setSpotifyPlayer,
				user,
				queue,
				playerStatus,
				setLoading,
				setPlaying,
				setPercent,
				setCurrentTime,
				setPlayerActive
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
		setPercent,
		setCurrentTime,
	]);

	let updateVolume = (e, data) => {
		spotifyPlayer.setVolume(e.target.value / 100);
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

	async function play() {
		socket.emit('play', { user });
	}

	function skip() {
		socket.emit('skip', { user });
	}

	// function formatDuration(millis) {
	// 	var minutes = Math.floor(millis / 60000);
	// 	var seconds = ((millis % 60000) / 1000).toFixed(0);
	// 	return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	// }

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
						<div className='like-icon-container'>
							{likedSongs.includes(queue[0].ui.id) ? (
								<FontAwesomeIcon className='like-icon' icon={faHeart} />
							) : (
								<FontAwesomeIcon
									className='like-icon'
									icon={heartOutline}
									onClick={() => {
										addSongToLibrary(
											queue[0].spotify,
											queue[0].apple,
											queue[0].ui.id
										);
									}}
								/>
							)}
						</div>
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
				<div className='player-controls-container'>
					{buttonsClickable ? (
						<div className='player-controls'>
							<FontAwesomeIcon className='skip-icon' icon={faStepBackward} />
							<button className='play-button' onClick={() => play()}>
								{playing ? (
									<FontAwesomeIcon className='action-icon' icon={faPause} />
								) : (
									<FontAwesomeIcon className='action-icon' icon={faPlay} />
								)}
							</button>
							<FontAwesomeIcon
								className='skip-icon'
								onClick={() => skip()}
								icon={faStepForward}
							/>
						</div>
					) : (
						<LoadingSpinner />
					)}
				</div>
				<TimeBar percent={percent} currentTime={currentTime} song={song} />
			</div>
			<div className='player-right'>
				<FontAwesomeIcon className='volume-icon' icon={faVolumeUp} />
				<input
					className='volume-slider'
					type='range'
					min='0'
					max='100'
					defaultValue={volume}
					onChange={updateVolume}
					disabled={playerActive ? false : true}
				/>
			</div>
		</div>
	);
}

export default SpotifyPlayer;
