import React from 'react';
import './track-display.scss';

export default function TrackDisplay({ tracks }) {
	const hasTracks = tracks[0];
	return (
		<div className='tracks'>
			<h1>Tracks</h1>
			{hasTracks
				? tracks.map(({ trackName, artits, trackCover, id }) => (
						<div key={id} className='results-display'>
							<div className='album-cover-container'>
								<img src={trackCover} alt='' />
							</div>
							<div className='text'>
								<p className='primary'>{trackName}</p>
								<p>{artits}</p>
							</div>
							<div className='add-button'>+</div>
						</div>
				  ))
				: null}
		</div>
	);
}
