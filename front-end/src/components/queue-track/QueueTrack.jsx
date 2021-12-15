import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faHeart } from '@fortawesome/free-solid-svg-icons';
import appleLogo from '../../assets/images/apple-music-logo.svg';
import spotifyLogo from '../../assets/images/spotify-logo.svg';
import PlayingAnimation from '../playing-animation/PlayingAnimation';
import './queue-track.scss';

export default function QueueTrack({
	song,
	index,
	buttonsClickable,
	setLikedSongs,
	likedSongs,
	user,
	playing,
}) {
	const { ui, apple, spotify } = song;
	const { apple: appleContext } = useContext(PlayersContext);
	const [applePlayer] = appleContext;
	const [socket] = useContext(SocketContext);

	async function addSongToLibrary(spotifySong, appleSong, id) {
		setLikedSongs([...likedSongs, id]);
		if (user.music_provider === 'apple') {
			await applePlayer.addToLibrary(appleSong);
		} else {
			socket.emit('likeSong', { spotifySong, user });
		}
	}

	function remove(index) {
		socket.emit('remove', { lobby_id: user.lobby_id, index });
	}

	return (
		<div className='queue-track' key={index}>
			<div className='index-wrapper'>
				{playing && index === 0 ? (
					<PlayingAnimation />
				) : (
					<p className='index'>{index + 1}</p>
				)}
			</div>

			<div className='primary-info'>
				<div className='album-cover-container'>
					<img src={ui.trackCover} alt='' />
				</div>
				<div className='text'>
					<p className='track-title'>{ui.trackName}</p>
					<p className='simple-text track-artists'>{ui.artists}</p>
				</div>
				<div className='availability'>
					{apple === '-1' ? (
						<img className='apple-logo' src={appleLogo} alt='' />
					) : null}
					{spotify === '-1' ? (
						<img className='spotify-logo' src={spotifyLogo} alt='' />
					) : null}
				</div>
			</div>

			<div className='added-by'>
				<p className='simple-text'>{ui.addedBy}</p>
			</div>

			<div className='duration'>
				<p className='simple-text'>{ui.formattedDuration}</p>
			</div>

			<div className='action-buttons'>
				{buttonsClickable ? (
					likedSongs.includes(ui.uniId) ? (
						<FontAwesomeIcon className='action-icon' icon={faHeart} />
					) : (
						<FontAwesomeIcon
							className='action-icon'
							icon={faHeart}
							onClick={() => {
								addSongToLibrary(spotify, apple, ui.uniId);
							}}
						/>
					)
				) : (
					<p>loading</p>
				)}
				{buttonsClickable ? (
					<FontAwesomeIcon
						className='action-icon'
						icon={faTrash}
						onClick={() => remove(index)}
					/>
				) : (
					<p>loading</p>
				)}
			</div>
		</div>
	);
}