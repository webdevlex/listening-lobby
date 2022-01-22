import React, { useContext, useEffect, useRef } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import useChildParentOverflow from '../../hooks/childParentOverflow';
import LoadingSpinner from '../loading-spinner/LoadingSpinner';
import './full-album.scss';

export default function FullAlbum({
	user,
	buttonsClickable,
	beenAdded,
	searchLoading,
	setSearchLoading,
	fullAlbum,
	setCenterDisplay,
	setFullAlbum,
}) {
	const [socket] = useContext(SocketContext);
	const { trackCover, albumName, albumArtist } = fullAlbum[0];
	const parent = useRef();
	const title = useRef();
	const artists = useRef();

	const { titleOverflow, artistsOverflow } = useChildParentOverflow(
		parent,
		title,
		artists
	);

	useEffect(() => {
		return () => {
			setFullAlbum(null);
		};
	}, [setCenterDisplay, setFullAlbum]);

	function handleSongClick(songData) {
		socket.emit('addSong', { songData, user });
	}

	console.log(fullAlbum);

	return (
		<div className='full-album'>
			<div className='back-button' onClick={() => setCenterDisplay('search')}>
				<FontAwesomeIcon className='back-icon' icon={faAngleLeft} />
				<p className='back-text'>Back</p>
			</div>
			<div className='full-album-info-dispaly'>
				<div className='full-album-cover-wrapper'>
					<img className='full-album-cover' src={trackCover} alt='' />
				</div>

				<div ref={parent} className='full-album-text'>
					<div
						className={`full-album-name-container ${
							titleOverflow ? 'slide' : null
						}`}>
						<p className='full-album-name' ref={title}>
							{albumName}
						</p>
						{titleOverflow ? (
							<p className='full-album-name'>{albumName}</p>
						) : null}
					</div>

					<div
						className={`full-album-artist-container ${
							artistsOverflow ? 'slide' : null
						}`}>
						<p ref={artists} className='full-album-artist'>
							{albumArtist}
						</p>
						{artistsOverflow ? (
							<p className='full-album-artist'>{albumArtist}</p>
						) : null}
					</div>
				</div>
			</div>

			<div className='full-album-header'>
				<p className='header-text hash-tag'>#</p>
				<p className='header-text title'>Title</p>
				<p className='header-text duration'>Duration</p>
				<p className='header-text add'>Add</p>
			</div>

			{fullAlbum.map((track, index) => (
				<div
					key={index}
					className='results-display'
					onDoubleClick={() => handleSongClick(track)}>
					<div className='index-wrapper'>
						<p className='index'>{index + 1}</p>
					</div>

					<div className='cover-and-text-wrapper'>
						<div className='album-cover-container'>
							<img src={track.trackCover} alt='' />
						</div>

						<div className='text'>
							<p className='title'>{track.trackName}</p>
							<div className='all-artists'>
								<p className='simple-text artists'>{track.artists}</p>
							</div>
						</div>
					</div>

					<div className='duration-wrapper'>
						<p className='duration'>{track.formattedDuration}</p>
					</div>

					<div className='search-result-action-icon'>
						{buttonsClickable ? (
							beenAdded.current.includes(track.uniId || track.id) ? (
								<FontAwesomeIcon className='check-icon' icon={faCheck} />
							) : (
								<div
									className='add-button'
									onClick={() => handleSongClick(track)}>
									+
								</div>
							)
						) : (
							<LoadingSpinner />
						)}
					</div>
				</div>
			))}
		</div>
	);
}
