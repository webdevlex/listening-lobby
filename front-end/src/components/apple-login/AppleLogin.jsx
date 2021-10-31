import React, { useState, useContext, useEffect } from 'react';
import { AppleMusicContext } from '../../context/AppleMusicContext';
import { Redirect } from 'react-router-dom';
import { setUpMusicKit } from './musicKitSetup';

function AppleLogin() {
	const [musicKit, setMusicKit] = useContext(AppleMusicContext);
	const [authorized, setAuthorized] = useState(false);
	const [appleToken, setAppleToken] = useState('');

	useEffect(() => {
		setUpMusicKit(
			authorized,
			setAuthorized,
			setMusicKit,
			setAppleToken
		);
	}, [authorized, setAuthorized, setMusicKit, setAppleToken]);

	if (authorized) {
		return <Redirect to={`/lobby?token=${appleToken}`} />;
	}
	return <></>;
}

export default AppleLogin;
