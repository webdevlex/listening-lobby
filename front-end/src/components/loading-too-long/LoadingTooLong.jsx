import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './loading-too-long.scss';

export default function LoadingTooLong({ loadingTooLong, setLoadingTooLong }) {
	function handleOutsideClick(e) {
		if (e.target.className === 'popup') {
			document.body.style.overflow = 'auto';
			setLoadingTooLong(false);
		}
	}

	if (loadingTooLong) {
		document.body.style.overflow = 'hidden';
	}

	return loadingTooLong ? (
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
					<p className='main-text'>Poor internet connection!</p>
					<p className='sub-text'>
						You were causing long load times in the lobby, this may be caused by
						poor internet connection.
					</p>
				</div>
			</div>
		</div>
	) : null;
}
