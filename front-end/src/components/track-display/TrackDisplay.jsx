import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import './track-display.scss';

export default function TrackDisplay({
	tracks,
	user,
	buttonsClickable,
	beenAdded,
}) {
	const [socket] = useContext(SocketContext);

	function handleSongClick(songData) {
		socket.emit('addSong', { songData, user });
	}

	const hasTracks = tracks[0];

	return (
		<div className='search-tracks-display'>
			{hasTracks ? (
				tracks.map((track, index) => (
					<div key={index} className='results-display'>
						<div className='album-cover-container'>
							<img src={track.trackCover} alt='' />
						</div>
						<div className='text'>
							<p className='title'>{track.trackName}</p>
							<p className='simple-text artists'>{track.artists}</p>
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
								<div className='loading'>loading</div>
							)}
						</div>
					</div>
				))
			) : (
				<p className='simple-text'>No Results . . .</p>
			)}
		</div>
	);
}
