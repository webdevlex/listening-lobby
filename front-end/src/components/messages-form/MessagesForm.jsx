import React, { useContext } from 'react';
import { SocketContext } from '../../context/socketContext';
import { useForm } from 'react-hook-form';

function MessagesForm({ user }) {
	const socket = useContext(SocketContext);
	const { register, handleSubmit, setValue } = useForm();

	const onSubmit = ({ message }) => {
		sendMessage(message);
	};

	function sendMessage(message) {
		setValue('message', '');
		socket.emit('message', {
			lobby_id: user.lobby_id,
			message: message,
		});
	}

	return (
		<form className='' onSubmit={handleSubmit(onSubmit)}>
			<div className='message-input'>
				<label htmlFor='message'>Message: </label>
				<input {...register('message')} />
			</div>
			<button type='submit' className='send-message-button'>
				Send Message
			</button>
		</form>
	);
}

export default MessagesForm;