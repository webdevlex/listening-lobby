import React, { useContext } from 'react';
import { SocketContext } from '../../context/socketContext';
import './track-display.scss';

export default function TrackDisplay({ tracks }) {
	const socket = useContext(SocketContext);

	function handleSongClick(song) {
		socket.emit('addSongToQueue', song);
	}

	const hasTracks = tracks[0];

	return (
		<div className='tracks'>
			<h1>Tracks</h1>
			{hasTracks
				? tracks.map(
						({ trackName, artists, trackCover, id, uniId }) => (
							<div
								key={id}
								className='results-display'
								onClick={() =>
									handleSongClick({ trackName, artists, id, uniId })
								}>
								<div className='album-cover-container'>
									<img src={trackCover} alt='' />
								</div>
								<div className='text'>
									<p className='primary'>{trackName}</p>
									<p>{artists}</p>
								</div>
								<div className='add-button'>+</div>
							</div>
						)
				  )
				: null}
		</div>
	);
}
