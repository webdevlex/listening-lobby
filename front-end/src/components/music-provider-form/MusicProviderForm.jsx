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
	setError,
}) {
	const [displayAppleLogin, setDisplayAppleLogin] = useState(false);
	const [authorized, setAuthorized] = useState(false);
	const MAX_USERNAME_CHARACTERS = 15;
	const LOBBY_ID_CHARACTERS = 6;

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
		const username = formData.username.trim();
		const validUsername =
			username !== '' &&
			username !== 'Username' &&
			username.length <= MAX_USERNAME_CHARACTERS;
		const validProvider =
			formData.musicProvider === 'apple' ||
			formData.musicProvider === 'spotify';

		const newLobby = action === 'create';
		const validLobbyId =
			formData.lobby_id.trim().length === LOBBY_ID_CHARACTERS || newLobby;

		if (validUsername && validProvider && validLobbyId) {
			if (newLobby) formData.lobby_id = generateRandomString(6);
			const localUserData = JSON.stringify({
				username: username,
				music_provider: formData.musicProvider,
				lobby_id: formData.lobby_id,
				admin: formData.lobby_id ? false : true,
				authorized: true,
				frontEndId: generateRandomString(6),
			});
			localStorage.setItem('user', localUserData);
			redirectTo(formData.musicProvider);
		} else if (!validUsername) {
			setError('username', {
				type: 'invalid',
			});
		} else if (!validProvider) {
			setError('musicProvider', {
				type: 'invalid',
			});
		} else if (!validLobbyId) {
			setError('lobby_id', {
				type: 'invalid',
			});
		}
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
		const url =
			process.env.NODE_ENV === 'production'
				? 'www.listeninglobby.com'
				: 'http://localhost:8888';
		window.location.replace(`${url}/spotify/login`);
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
						<div
							className='lobby-id-input'
							aria-invalid={errors.lobby_id ? 'true' : 'false'}>
							<FontAwesomeIcon className='user-icon' icon={faLock} />
							<input
								readOnly={lobby_id ? true : false}
								maxLength={LOBBY_ID_CHARACTERS}
								{...register('lobby_id', {
									required: true,
									maxLength: LOBBY_ID_CHARACTERS,
								})}
								onFocus={(e) => handleFocus(e)}
								onBlur={(e) => handleBlur(e)}
							/>
						</div>
					) : null}

					{/* Input for username */}
					<div
						className='username-input'
						aria-invalid={errors.username ? 'true' : 'false'}>
						<FontAwesomeIcon className='user-icon' icon={faUser} />
						<input
							autoComplete='off'
							maxLength={MAX_USERNAME_CHARACTERS}
							{...register('username', {
								required: true,
								maxLength: MAX_USERNAME_CHARACTERS,
							})}
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
