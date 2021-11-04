import React from 'react';
import MessagesForm from '../messages-form/MessagesForm';

function LobbyMessages({ messages, user }) {
	return (
		<div>
			<h4>Messages</h4>
			{messages[0] &&
				messages.map(({ username, message }) => {
					return <p key={username}>{`${username}: ${message}`}</p>;
				})}
			<MessagesForm user={user} />
		</div>
	);
}

export default LobbyMessages;
