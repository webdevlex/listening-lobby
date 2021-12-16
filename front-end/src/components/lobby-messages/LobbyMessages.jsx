import React from 'react';
import MessagesForm from '../messages-form/MessagesForm';
import MessageDisplay from '../message-display/MessageDisplay';
import './lobby-messages.scss';

function LobbyMessages({ messages, user }) {
	const hasMessages = messages[0];
	return (
		<div className='lobby-messages'>
			<h4 className='section-title'>Messages</h4>
			<div className='messages-container'>
				{hasMessages &&
					messages.map((messageData) => (
						<MessageDisplay messageData={messageData} />
					))}
			</div>

			<MessagesForm user={user} />
		</div>
	);
}

export default LobbyMessages;
