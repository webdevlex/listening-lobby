import React from 'react';
import './lobby-settings.scss';

export default function LobbySettings({
	lobbyId,
	centerDisplay,
	setCenterDisplay,
}) {
	return (
		<div className='lobby-settings'>
			<p>{lobbyId}</p>
			<p className='settings-button' onClick={() => setCenterDisplay('player')}>
				Home
			</p>
			<p className='settings-button' onClick={() => setCenterDisplay('search')}>
				Search
			</p>
			<p className='settings-button' onClick={() => setCenterDisplay('invite')}>
				Invite Friends
			</p>
			<p
				className='settings-button'
				onClick={() => setCenterDisplay('settings')}>
				Settings
			</p>
		</div>
	);
}
