import React, { useState } from 'react';
import AppleLogin from '../apple-login/AppleLogin';

function MusicProviderForm({ handleSubmit, register, errors }) {
	const params = new URLSearchParams(window.location.search);
	const action = params.get('action');
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

	return (
		<>
			{displayAppleLogin ? (
				<AppleLogin authorized={authorized} setAuthorized={setAuthorized} />
			) : null}
			<form className='music-provider-form' onSubmit={handleSubmit(onSubmit)}>
				<div className='inputs'>
					{/* Hidden input for music provider, value set by MusicProviderButtons component via the setValue function */}
					<input
						className='hidden'
						{...register('musicProvider', { required: true })}
					/>

					{/* Only display lobby id input if url contains the action parameter of "join" */}
					{action === 'join' ? (
						<>
							<label htmlFor='lobby_id'>Lobby Id</label>
							<input
								aria-invalid={errors.lobby_id ? 'true' : 'false'}
								{...register('lobby_id', { required: true })}
							/>
						</>
					) : null}

					{/* Input for username */}
					<label htmlFor='username'>Username</label>
					<input
						aria-invalid={errors.username ? 'true' : 'false'}
						{...register('username', { required: true })}
					/>
				</div>

				{/* Change text depending on url action parameter */}
				<button type='submit' className='create-lobby-button'>
					{action === 'join' ? 'Join Lobby' : 'Create Lobby'}
				</button>
			</form>
		</>
	);
}

export default MusicProviderForm;
