import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
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
			<div className='full-album-info-dispaly'>
				<div className='full-album-cover-wrapper'>
					<img className='full-album-cover' src={trackCover} alt='' />
				</div>

				<div className='full-album-text'>
					<p className='full-album-name'>{albumName}</p>
					<p className='full-album-artist'>{albumArtist}</p>
				</div>
			</div>
			{fullAlbum.map((track, index) => (
				<div
					key={index}
					className='results-display'
					onDoubleClick={() => handleSongClick(track)}>
					<div className='album-cover-container'>
						<img src={track.trackCover} alt='' />
					</div>
					<div className='text'>
						<p className='title'>{track.trackName}</p>
						<div className='all-artists'>
							<p className='simple-text artists'>{track.artists}</p>
						</div>
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
