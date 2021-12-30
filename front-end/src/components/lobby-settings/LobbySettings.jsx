import React from 'react';
import './lobby-settings.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useWindowSize from '../../hooks/hooks';
import {
	faHome,
	faSearch,
	faUsers,
	faEnvelope,
} from '@fortawesome/free-solid-svg-icons';

export default function LobbySettings({
	setCenterDisplay,
	setDisplayInvitePopup,
}) {
	const [width] = useWindowSize();

	return (
		<div className='lobby-settings'>
			<h4 className='section-title'>Menu</h4>
			<div
				className='settings-button'
				onClick={() => setCenterDisplay('player')}>
				<FontAwesomeIcon className='settings-icon' icon={faHome} />
				<p className='simple-text'>Queue</p>
			</div>
			<div
				className='settings-button'
				onClick={() => setCenterDisplay('search')}>
				<FontAwesomeIcon className='settings-icon' icon={faSearch} />
				<p className='simple-text'>Search</p>
			</div>
			{width > 850 ? (
				<div
					className='settings-button'
					onClick={() => setDisplayInvitePopup(true)}>
					<FontAwesomeIcon className='settings-icon' icon={faUsers} />
					<p className='simple-text'>Invite Friends</p>
				</div>
			) : (
				<div
					className='settings-button'
					onClick={() => setCenterDisplay('members')}>
					<FontAwesomeIcon className='settings-icon' icon={faUsers} />
					<p className='simple-text'>Members</p>
				</div>
			)}

			<div
				className='settings-button messages-button'
				onClick={() => setCenterDisplay('messages')}>
				<FontAwesomeIcon className='settings-icon' icon={faEnvelope} />
				<p className='simple-text'>Messages</p>
			</div>
		</div>
	);
}
