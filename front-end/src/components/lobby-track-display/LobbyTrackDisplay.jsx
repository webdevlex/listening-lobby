import React, { useRef, useEffect } from 'react';
import useChildParentOverflow from '../../hooks/childParentOverflow';
import TimeBar from '../time-bar/TimeBar';
import './lobby-track-display.scss';

export default function LobbyTrackDisplay({ queue, percent, currentTime }) {
	const song = queue[0];
	const parent = useRef();
	const title = useRef();
	const artists = useRef();

	const { titleOverflow, artistsOverflow } = useChildParentOverflow(
		parent,
		title,
		artists
	);

	return (
		<div className='track-display-wrapper'>
			<div className='track-display-top'>
				{song ? (
					<>
						<div className='track-display-left'>
							<img className='track-cover' src={song.ui.trackCover} alt='' />
						</div>

						<div ref={parent} className='track-display-right'>
							<div
								className={`track-title-container ${
									titleOverflow ? 'slide' : null
								}`}>
								<p ref={title} className='track-title'>
									{song.ui.trackName}
								</p>
								{titleOverflow ? (
									<p className='track-title'>{song.ui.trackName}</p>
								) : null}
							</div>

							<div
								className={`artists-container ${
									artistsOverflow ? 'slide' : null
								}`}>
								<p ref={artists} className='artists'>
									{song.ui.artists}
								</p>
								{artistsOverflow ? (
									<p className='artists'>{song.ui.artists}</p>
								) : null}
							</div>

							<TimeBar
								percent={percent}
								currentTime={currentTime}
								song={song}
							/>
						</div>
					</>
				) : (
					<>
						<div className='track-display-left'>
							<p className='default-album'>?</p>
						</div>
						<div ref={parent} className='track-display-right'>
							<div
								className={`track-title-container ${
									titleOverflow ? 'slide' : null
								}`}>
								<p ref={title} className='track-title'>
									No Songs Added
								</p>
								{titleOverflow ? (
									<p className='track-title'>No Songs Added</p>
								) : null}
							</div>
							<div
								className={`artists-container ${
									artistsOverflow ? 'slide' : null
								}`}>
								<p ref={artists} className='artists'>
									Search and add songs to queue!
								</p>
								{artistsOverflow ? (
									<p className='artists'>Search and add songs to queue!</p>
								) : null}
							</div>
						</div>
					</>
				)}
			</div>
			<div className='queue-header-wrapper'>
				<div className='queue-header'>
					<p className='header-text track-index'>#</p>
					<p className='header-text track-title'>Title</p>
					<p className='header-text track-user'>Added By</p>
					<p className='header-text track-duration'>duration</p>
					<p className='header-text track-like'>Like</p>
					<p className='header-text track-remove'>Remove</p>
				</div>
			</div>
		</div>
	);
}
