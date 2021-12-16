import React from 'react';
import './message-display.scss';

export default function MessageDisplay({ messageData }) {
	const { username, message } = messageData;
	return (
		<div className='message-display'>
			<div className='username-and-timestamp'>
				<p className='username'>{username}</p>
				<p className='timestamp'>5:22 PM</p>
			</div>
			<p className='simple-text message'>{message}</p>
		</div>
	);
}
