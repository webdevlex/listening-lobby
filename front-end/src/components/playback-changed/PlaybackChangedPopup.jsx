import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './playback-changed-popup.scss';

export default function PlaybackChanged({
	playbackChanged,
	setPlaybackChanged,
}) {
	function handleOutsideClick(e) {
		if (e.target.className === 'popup') {
			document.body.style.overflow = 'auto';
			setPlaybackChanged(false);
		}
	}

	if (playbackChanged) {
		document.body.style.overflow = 'hidden';
	}

	return playbackChanged ? (
		<div
			className='popup'
			onClick={(e) => {
				handleOutsideClick(e);
			}}>
			<div className='playback-popup-container'>
				<div className='warning-icon-container'>
					<FontAwesomeIcon
						className='warning-icon'
						icon={faExclamationTriangle}
					/>
					<div className='exclamation-color'></div>
				</div>

				<div className='playback-warning-text'>
					<p className='main-text'>Playback changed to another device!</p>
					<p className='sub-text'>
						You cannot change playback while you are in a lobby.
					</p>
				</div>
			</div>
		</div>
	) : null;
}
