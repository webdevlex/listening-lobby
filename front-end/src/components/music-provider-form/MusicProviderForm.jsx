import React, { useState } from 'react';
import AppleLogin from '../apple-login/AppleLogin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import './music-provider-form.scss';

function MusicProviderForm({
	handleSubmit,
	register,
	errors,
	action,
	lobby_id,
	getValues,
	setValue,
}) {
	const [displayAppleLogin, setDisplayAppleLogin] = useState(false);
	const [authorized, setAuthorized] = useState(false);

	var generateRandomString = function (length) {
		var text = '';
		var possible =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (var i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	};

	const onSubmit = (formData) => {
		const localUserData = JSON.stringify({
			username: formData.username,
			music_provider: formData.musicProvider,
			lobby_id: formData.lobby_id || generateRandomString(6),
			admin: formData.lobby_id ? false : true,
			authorized: true,
		});
		localStorage.setItem('user', localUserData);
		redirectTo(formData.musicProvider);
	};

	function redirectTo(musicProvider) {
		if (musicProvider === 'spotify') {
			redirectToSpotify();
		} else if (musicProvider === 'apple') {
			redirectToApple();
		}
	}

	function redirectToApple() {
		setDisplayAppleLogin(true);
	}

	function redirectToSpotify() {
		window.location.replace('http://localhost:8888/spotify/login');
	}

	const handleFocus = (e) => {
		const target = e.target.name;
		const usernameValue = getValues('username');
		const lobbyIdValue = getValues('lobby_id');
		if (usernameValue === 'Username' && target === 'username') {
			setValue('username', '');
		} else if (lobbyIdValue === 'Lobby ID' && target === 'lobby_id') {
			setValue('lobby_id', '');
		}
	};

	const handleBlur = () => {
		const usernameValue = getValues('username');
		const lobbyIdValue = getValues('lobby_id');
		if (usernameValue === '') {
			setValue('username', 'Username');
		}
		if (lobbyIdValue === '') {
			setValue('lobby_id', 'Lobby ID');
		}
	};

	return (
		<>
			{displayAppleLogin ? (
				<AppleLogin authorized={authorized} setAuthorized={setAuthorized} />
			) : null}
			<form className='music-provider-form' onSubmit={handleSubmit(onSubmit)}>
				<div className='inputs'>
					{/* Hidden input for music provider, value set by MusicProviderButtons component via the setValue function */}
					<input
						className='hide'
						{...register('musicProvider', { required: true })}
					/>

					{/* Only display lobby id input if url contains the action parameter of "join" */}
					{action === 'join' ? (
						<div className='lobby-id-input'>
							<FontAwesomeIcon className='user-icon' icon={faLock} />
							<input
								readOnly={lobby_id ? true : false}
								aria-invalid={errors.lobby_id ? 'true' : 'false'}
								maxLength='6'
								{...register('lobby_id', { required: true, maxLength: 6 })}
								onFocus={(e) => handleFocus(e)}
								onBlur={(e) => handleBlur(e)}
							/>
						</div>
					) : null}

					{/* Input for username */}
					<div className='username-input'>
						<FontAwesomeIcon className='user-icon' icon={faUser} />
						<input
							aria-invalid={errors.username ? 'true' : 'false'}
							{...register('username', { required: true })}
							onFocus={(e) => handleFocus(e)}
							onBlur={(e) => handleBlur(e)}
						/>
					</div>
				</div>

				{/* Change text depending on url action parameter */}
				<button type='submit' className='default-button'>
					{action === 'join' ? 'Join Lobby' : 'Create Lobby'}
				</button>
			</form>
		</>
	);
}

export default MusicProviderForm;
