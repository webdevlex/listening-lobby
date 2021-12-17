import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import './track-display.scss';

export default function TrackDisplay({
	tracks,
	user,
	buttonsClickable,
	addedToQueue,
	setAddedToQueue,
}) {
	const [socket] = useContext(SocketContext);

	function handleSongClick(songData) {
		setAddedToQueue([...addedToQueue, songData.uniId]);
		socket.emit('addSong', { songData, user });
	}

	const hasTracks = tracks[0];

	return (
		<div className='search-tracks-display'>
			{hasTracks
				? tracks.map((track) => (
						<div key={track.uniId} className='results-display'>
							<p>{addedToQueue.includes(track.isrc)}</p>
							<div className='album-cover-container'>
								<img src={track.trackCover} alt='' />
							</div>
							<div className='text'>
								<p className='title'>{track.trackName}</p>
								<p className='simple-text artists'>{track.artists}</p>
							</div>
							<div className='search-result-action-icon'>
								{buttonsClickable ? (
									addedToQueue.includes(track.uniId) ? (
										<FontAwesomeIcon className='check-icon' icon={faCheck} />
									) : (
										<div
											className='add-button'
											onClick={() => handleSongClick(track)}>
											+
										</div>
									)
								) : (
									<div className='loading'>loading</div>
								)}
							</div>
						</div>
				  ))
				: null}
		</div>
	);
}
