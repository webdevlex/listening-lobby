import React from 'react';
import './lobby-track-display.scss';

export default function LobbyTrackDisplay({ queue }) {
	const song = queue[0];
	return (
		<div className='track-display-wrapper'>
			<div className='track-display-top'>
				{song ? (
					<>
						<div className='track-display-left'>
							<img className='track-cover' src={song.ui.trackCover} alt='' />
						</div>
						<div className='track-display-right'>
							<p className='track-title'>{song.ui.trackName}</p>
							<p className='artists'>{song.ui.artists}</p>
						</div>
					</>
				) : (
					<>
						<div className='track-display-left'>
							<p className='default-album'>?</p>
						</div>
						<div className='track-display-right'>
							<p className='track-title'>No Songs Added</p>
							<p className='artists'>Search and add songs to queue!</p>
						</div>
					</>
				)}
			</div>
			<div className='queue-header'>
				<p className='header-text track-index'>#</p>
				<p className='header-text track-title'>Title</p>
				<p className='header-text track-user'>Added By</p>
				<p className='header-text track-duration'>duration</p>
				<p className='header-text track-like'>Like</p>
				<p className='header-text track-remove'>Remove</p>
			</div>
		</div>
	);
}
