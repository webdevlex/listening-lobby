import React from 'react';
import './lobby-settings.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faHome,
	faSearch,
	faUsers,
	faTools,
} from '@fortawesome/free-solid-svg-icons';

export default function LobbySettings({
	setCenterDisplay,
	setDisplayInvitePopup,
}) {
	return (
		<div className='lobby-settings'>
			<h4 className='section-title'>Menu</h4>
			<div
				className='settings-button'
				onClick={() => setCenterDisplay('player')}>
				<FontAwesomeIcon className='settings-icon' icon={faHome} />
				<p className='simple-text'>Home</p>
			</div>
			<div
				className='settings-button'
				onClick={() => setCenterDisplay('search')}>
				<FontAwesomeIcon className='settings-icon' icon={faSearch} />
				<p className='simple-text'>Search</p>
			</div>
			<div
				className='settings-button'
				onClick={() => setDisplayInvitePopup(true)}>
				<FontAwesomeIcon className='settings-icon' icon={faUsers} />
				<p className='simple-text'>Invite Friends</p>
			</div>
			<div
				className='settings-button'
				onClick={() => setCenterDisplay('settings')}>
				<FontAwesomeIcon className='settings-icon' icon={faTools} />
				<p className='simple-text'>Settings</p>
			</div>
		</div>
	);
}
