import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './max-cap-popup.scss';

export default function MaxCapPopup({ maxReached, setMaxReached }) {
	function handleOutsideClick(e) {
		if (e.target.className === 'popup') {
			setMaxReached(false);
		}
	}

	return maxReached ? (
		<div
			className='popup'
			onClick={(e) => {
				handleOutsideClick(e);
			}}>
			<div className='max-cap-popup-container'>
				<div className='warning-icon-container'>
					<FontAwesomeIcon
						className='warning-icon'
						icon={faExclamationTriangle}
					/>
					<div className='exclamation-color'></div>
				</div>

				<div className='max-cap-warning-text'>
					<p className='main-text'>Maximum lobby capacity reached!</p>
					<p className='sub-text'>
						There can be a maximum of 8 users in a lobby at a time, we apologize
						for the inconvenience.
					</p>
				</div>
			</div>
		</div>
	) : null;
}
