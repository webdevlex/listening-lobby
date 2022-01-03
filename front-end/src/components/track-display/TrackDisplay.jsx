import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../loading-spinner/LoadingSpinner';
import './track-display.scss';

export default function TrackDisplay({
	tracks,
	user,
	buttonsClickable,
	beenAdded,
	searchLoading,
	setArtistSearch,
}) {
	const [socket] = useContext(SocketContext);

	function handleSongClick(songData) {
		socket.emit('addSong', { songData, user });
	}

	function handleArtistClick(searchValue) {
		setArtistSearch(searchValue);
		socket.emit('artistSearch', { searchValue, user });
	}

	const hasTracks = tracks[0];

	return (
		<div className='search-tracks-display'>
			{!searchLoading ? (
				hasTracks ? (
					tracks.map((track, index) => (
						<div key={index} className='results-display'>
							<div className='album-cover-container'>
								<img src={track.trackCover} alt='' />
							</div>
							<div className='text'>
								<p className='title'>{track.trackName}</p>
								<div className='all-artists'>
									{track.artists.split(',').map((artist) => (
										<p
											className='simple-text artists'
											onClick={() => handleArtistClick(artist)}>
											{artist}
										</p>
									))}
								</div>
							</div>
							<div className='search-result-action-icon'>
								{buttonsClickable ? (
									beenAdded.current.includes(track.uniId) ? (
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
					))
				) : (
					<p className='simple-text'>No Results . . .</p>
				)
			) : (
				<LoadingSpinner />
			)}
		</div>
	);
}
