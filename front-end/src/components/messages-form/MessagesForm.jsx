import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContextProvider';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './message-form.scss';

function MessagesForm({ user, isShowing }) {
	const [socket] = useContext(SocketContext);
	const { register, handleSubmit, setValue, getValues } = useForm({
		defaultValues: { message: 'Message' },
	});
	const MESSAGE_MAX_LENGTH = 256;

	const onSubmit = ({ message }) => {
		message = message.trim();
		const validMessage =
			message !== '' &&
			message !== 'Message' &&
			message.length <= MESSAGE_MAX_LENGTH;

		if (validMessage) {
			document.activeElement.blur();
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
			<div className={`message-input ${isShowing ? 'tab-showing' : null}`}>
				<input
					autoComplete='off'
					maxLength={MESSAGE_MAX_LENGTH}
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
