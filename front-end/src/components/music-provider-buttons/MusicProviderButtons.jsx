import React, { useState } from 'react';
import appleLogo from '../../assets/images/apple-music-logo.svg';
import spotifyLogo from '../../assets/images/spotify-logo.svg';
import './music-provider-buttons.scss';

function MusicProviderButtons({ errors, setValue }) {
	// Used to add the class of "selected" to the designated button
	const [musicProvider, setMusicProviderTo] = useState('');

	function handleAppleClick() {
		setMusicProviderTo('apple');
		setValue('musicProvider', 'apple');
	}

	function handleSpotifyClick() {
		setMusicProviderTo('spotify');
		setValue('musicProvider', 'spotify');
	}

	return (
		<div
			aria-invalid={errors.musicProvider ? 'true' : 'false'}
			className='services-container'>
			{/* On click set hidden music provider input value to "apple" and add class of "selected" */}
			<button
				className={`logo-container ${
					musicProvider === 'apple' ? 'selected' : null
				}`}
				onClick={() => handleAppleClick()}>
				<img className='music-provider-logo' src={appleLogo} alt='' />
			</button>

			{/* On click set hidden music provider input value to "spotify" and add class of "selected" */}
			<button
				className={`logo-container ${
					musicProvider === 'spotify' ? 'selected' : null
				}`}
				onClick={() => handleSpotifyClick()}>
				<img className='music-provider-logo' src={spotifyLogo} alt='' />
			</button>
		</div>
	);
}

export default MusicProviderButtons;
