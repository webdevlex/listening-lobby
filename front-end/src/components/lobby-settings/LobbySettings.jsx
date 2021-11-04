import React from 'react';
import './lobby-settings.scss';

export default function LobbySettings({
	centerDisplay,
	setCenterDisplay,
}) {
	return (
		<div className='lobby-settings'>
			<p
				className='settings-button'
				onClick={() => setCenterDisplay('player')}>
				Player
			</p>
			<p
				className='settings-button'
				onClick={() => setCenterDisplay('search')}>
				Search
			</p>
		</div>
	);
}
