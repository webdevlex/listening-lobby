import React from 'react';
import './lobby-queue.scss';

export default function LobbyQueue({ queue }) {
	const queueHasItems = queue[0];
	return (
		<div className='lobby-queue'>
			<h1>Queue</h1>
			{queueHasItems &&
				queue.map(({ ui }, index) => (
					<div className='queue-item'>
						<p className='index'>{index + 1}</p>
						<div className='primary-info'>
							<div className='album-cover-container'>
								<img src={ui.trackCover} alt='' />
							</div>
							<div className='text'>
								<p className='primary-text'>{ui.trackName}</p>
								<p>{ui.artists}</p>
							</div>
						</div>
						<p className='remove-button'>remove</p>
					</div>
				))}
		</div>
	);
}
