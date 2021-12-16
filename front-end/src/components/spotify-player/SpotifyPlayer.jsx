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
	likedSongs,
	setLikedSongs,
}) {
	const [socket] = useContext(SocketContext);
	const { spotify, spotifyRan, apple } = useContext(PlayersContext);
	const [spotifyPlayer, setSpotifyPlayer] = spotify;
	const [applePlayer] = apple;

	const [volume, setVolume] = useState(10);
	const [ran, setRan] = spotifyRan;
	const song = queue[0];

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

	let updateVolume = (e, data) => {
		// spotifyPlayer.player.volume = e.target.value / 100;
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
					</>
				) : (
					<p>loading</p>
				)}
				<div className='time-bar'></div>
			</div>
			<div className='player-right'>
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

export default SpotifyPlayer;
