import React, { useState, useContext, useEffect } from 'react';
import { PlayersContext } from '../../context/PlayersContext';
import { Redirect } from 'react-router-dom';
import { setUpMusicKit } from './musicKitSetup';

function AppleLogin() {
	const { apple } = useContext(PlayersContext);
	const [applePlayer, setApplePlayer] = apple;
	const [authorized, setAuthorized] = useState(false);
	const [appleToken, setAppleToken] = useState('');

	useEffect(() => {
		if (!applePlayer) {
			console.log('no apple player');
			setUpMusicKit(authorized, setAuthorized, setApplePlayer, setAppleToken);
		}
	}, [authorized, setAuthorized, setApplePlayer, setAppleToken, applePlayer]);

	if (authorized) {
		console.log('Authorized!');
		return <Redirect to={`/lobby?token=${appleToken}`} />;
	}
	return <></>;
}

export default AppleLogin;
