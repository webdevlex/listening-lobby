import React from 'react';
import './lobby-queue.scss';

export default function LobbyQueue({ queue }) {
	const queueHasItems = queue[0];
	return (
		<div className='lobby-queue'>
			<h1>Queue</h1>
			{queueHasItems &&
				queue.map(
					({ trackName, artists, trackCover, id, uniId }, index) => (
						<div className='queue-item'>
							<p className='index'>{index + 1}</p>
							<div className='primary-info'>
								<div className='album-cover-container'>
									<img src={trackCover} alt='' />
								</div>
								<div className='text'>
									<p className='primary-text'>{trackName}</p>
									<p>{artists}</p>
								</div>
							</div>
							<p className='remove-button'>remove</p>
						</div>
					)
				)}
		</div>
	);
}
