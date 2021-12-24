import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './message-form.scss';

function MessagesForm({ user }) {
	const [socket] = useContext(SocketContext);
	const { register, handleSubmit, setValue, getValues } = useForm({
		defaultValues: { message: 'Message' },
	});

	const onSubmit = ({ message }) => {
		message = message.trim();
		if (message && message !== 'Message') {
			setValue('message', 'Message');
			socket.emit('lobbyMessage', { user, message });
		}
	};

	const handleFocus = () => {
		const value = getValues('message');
		if (value === 'Message') {
			setValue('message', '');
		}
	};

	const handleBlur = () => {
		const value = getValues('message');
		if (value === '') {
			setValue('message', 'Message');
		}
	};

	return (
		<form className='message-form' onSubmit={handleSubmit(onSubmit)}>
			<div className='message-input'>
				<input
					{...register('message')}
					onFocus={() => handleFocus()}
					onBlur={() => handleBlur()}
				/>
				<button type='submit' className='submit-button'>
					<FontAwesomeIcon className='arrrow-icon' icon={faArrowRight} />
				</button>
			</div>
		</form>
	);
}

export default MessagesForm;
