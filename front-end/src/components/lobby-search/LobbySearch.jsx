import React from 'react';
import UniSearch from '../uni-search/UniSearch';
import './lobby-search.scss';

export default function LobbySearch({ user, buttonsClickable }) {
	return (
		<div className='lobby-search'>
			<UniSearch user={user} buttonsClickable={buttonsClickable} />
		</div>
	);
}
