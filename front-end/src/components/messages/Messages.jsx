import React from 'react';

function Messages({ messages }) {
	return (
		<div>
			<h4>Messages</h4>
			{messages[0] &&
				messages.map(({ username, message }) => {
					return <p key={username}>{`${username}: ${message}`}</p>;
				})}
		</div>
	);
}

export default Messages;
