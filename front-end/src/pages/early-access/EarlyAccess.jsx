import React from 'react';
import { useForm } from 'react-hook-form';
import logo from '../../assets/images/alpha-logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Redirect } from 'react-router-dom';
import './early-access.scss';

export default function EarlyAccess({
	isAuthenticated,
	setIsAuthenticated,
	websitePrivate,
}) {
	const MAX_PASSWORD_CHARACTERS = 24;
	const PASSWORD = 'onlythehomies';

	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		setError,
		formState: { errors },
	} = useForm({
		defaultValues: {
			password: 'Password',
		},
	});

	const onSubmit = (formData) => {
		const password = formData.password.trim();
		setValue('password', 'Password');
		document.activeElement.blur();

		if (password === PASSWORD) {
			localStorage.setItem('earlyAccessAuth', true);
			setIsAuthenticated(true);
		} else {
			setError('password', 'invalid');
		}
	};

	const handleFocus = () => {
		const passwordValue = getValues('password');
		if (passwordValue === 'Password') {
			setValue('password', '');
		}
	};

	const handleBlur = () => {
		const passwordValue = getValues('password');
		if (passwordValue === '') {
			setValue('password', 'Password');
		}
	};

	if (!websitePrivate) {
		localStorage.setItem('earlyAccessAuth', true);
		setIsAuthenticated(true);
	}

	if (isAuthenticated) {
		return <Redirect to='/' />;
	}

	return (
		<div className='early-access-page'>
			<div className='early-access-logo-container'>
				<img src={logo} alt='' />
			</div>
			<form className='early-access-form' onSubmit={handleSubmit(onSubmit)}>
				<div
					className='password-input'
					aria-invalid={errors.password ? 'true' : 'false'}>
					<FontAwesomeIcon className='user-icon' icon={faLock} />
					<input
						maxLength={MAX_PASSWORD_CHARACTERS}
						{...register('password', {
							required: true,
							maxLength: MAX_PASSWORD_CHARACTERS,
						})}
						onFocus={(e) => handleFocus(e)}
						onBlur={(e) => handleBlur(e)}
					/>
					<button type='submit' className='submit-button'>
						<FontAwesomeIcon className='arrow-icon' icon={faArrowRight} />
					</button>
				</div>
			</form>
		</div>
	);
}
