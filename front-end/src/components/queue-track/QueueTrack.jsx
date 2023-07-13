import React, { useContext, useRef, useEffect } from 'react';
import { SocketContext } from '../../context/SocketContextProvider';
import { PlayersContext } from '../../context/PlayersContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import {
	faHeart as heartOutline,
	faTrashAlt,
} from '@fortawesome/free-regular-svg-icons';
import useChildParentOverflow from '../../hooks/childParentOverflow';
import appleLogo from '../../assets/images/apple-music-logo-red.svg';
import spotifyLogo from '../../assets/images/spotify-logo-red.svg';
import PlayingAnimation from '../playing-animation/PlayingAnimation';
import LoadingSpinner from '../loading-spinner/LoadingSpinner';
import './queue-track.scss';

export default function QueueTrack({
	song,
	index,
	buttonsClickable,
	setLikedSongs,
	likedSongs,
	user,
	playing,
	hover,
	hoverIndex,
}) {
	const { ui, apple, spotify } = song;
	const { apple: appleContext } = useContext(PlayersContext);
	const [applePlayer] = appleContext;
	const [socket] = useContext(SocketContext);

	const parent = useRef();
	const title = useRef();
	const artists = useRef();

	const { titleOverflow, artistsOverflow } = useChildParentOverflow(
		parent,
		title,
		artists
	);

	async function addSongToLibrary(spotifySong, appleSong, id) {
		setLikedSongs([...likedSongs, id]);
		if (user.music_provider === 'apple') {
			await applePlayer.addToLibrary(appleSong);
		} else {
			socket.emit('likeSong', { spotifySong, user });
		}
	}

	function remove(index) {
		socket.emit('remove', { user, index, songName: ui.trackName });
	}

	useEffect(() => {
		function recheckOverflows() {
			var element = window;
			var event = new Event('resize');
			element.dispatchEvent(event);
		}
		return () => recheckOverflows();
	}, []);

	return (
		<>
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
				<div ref={parent} className='text'>
					<div className='track-title-container'>
						<p ref={title} className='track-title'>
							{ui.trackName}
						</p>
						{titleOverflow ? (
							<p
								className={`three-dots ${
									hover && hoverIndex === index ? 'hover' : null
								}`}>
								...
							</p>
						) : null}
					</div>
					<div className='artists-title-container'>
						<p ref={artists} className='simple-text track-artists'>
							{ui.artists}
						</p>
						{artistsOverflow ? (
							<p
								className={`three-dots ${
									hover && hoverIndex === index ? 'hover' : null
								}`}>
								...
							</p>
						) : null}
					</div>
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
			<div className='like-button'>
				{buttonsClickable ? (
					likedSongs.includes(ui.id) ? (
						<FontAwesomeIcon className='action-icon' icon={faHeart} />
					) : (
						<FontAwesomeIcon
							className='action-icon'
							icon={heartOutline}
							onClick={() => {
								addSongToLibrary(spotify, apple, ui.id);
							}}
						/>
					)
				) : (
					<LoadingSpinner />
				)}
			</div>
			<div className='remove-button'>
				{buttonsClickable ? (
					<FontAwesomeIcon
						className='action-icon'
						icon={faTrashAlt}
						onClick={() => remove(index)}
					/>
				) : (
					<LoadingSpinner />
				)}
			</div>
		</>
	);
}
