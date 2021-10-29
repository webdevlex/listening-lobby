import React, { useState, useContext, useEffect } from 'react';
import { AppleMusicContext } from '../../context/AppleMusicContext';
import { Redirect } from 'react-router-dom';
import { setUpMusicKit } from './musicKitSetup';

function AppleLogin() {
	const [musicKit, setMusicKit] = useContext(AppleMusicContext);
	const [authorized, setAuthorized] = useState(false);

	useEffect(() => {
		setUpMusicKit(authorized, setAuthorized, setMusicKit);
	}, [authorized, setAuthorized, setMusicKit]);

	if (authorized) {
		return <Redirect to='/lobby' />;
	}
	return <></>;
}

export default AppleLogin;
