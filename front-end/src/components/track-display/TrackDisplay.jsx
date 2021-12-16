import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import './track-display.scss';

export default function TrackDisplay({ tracks, user, buttonsClickable }) {
	const [socket] = useContext(SocketContext);

	function handleSongClick(songData) {
		socket.emit('addSong', { songData, user });
	}

	const hasTracks = tracks[0];

	return (
		<div className='search-tracks-display'>
			{hasTracks
				? tracks.map((track) => (
						<div key={track.id} className='results-display'>
							<div className='album-cover-container'>
								<img src={track.trackCover} alt='' />
							</div>
							<div className='text'>
								<p className='title'>{track.trackName}</p>
								<p className='simple-text artists'>{track.artists}</p>
							</div>
							{buttonsClickable ? (
								<div
									className='add-button'
									onClick={() => handleSongClick(track)}>
									+
								</div>
							) : (
								<div className='loading'>loading</div>
							)}
						</div>
				  ))
				: null}
		</div>
	);
}
