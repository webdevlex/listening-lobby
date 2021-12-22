import React from 'react';
import './message-display.scss';

export default function MessageDisplay({ messageData }) {
	const { username, message, time } = messageData;
	return (
		<div className='message-display'>
			<div className='username-and-timestamp'>
				<p className='username'>{username}</p>
				<p className='timestamp'>{time}</p>
			</div>
			<p className='simple-text message'>{message}</p>
		</div>
	);
}
