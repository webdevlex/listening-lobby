import React, { useState, useContext, useEffect } from 'react';
import { PlayersContext } from '../../context/PlayersContextProvider';
import { Redirect } from 'react-router-dom';
import { setUpMusicKit } from './musicKitSetup';

function AppleLogin({ authorized, setAuthorized }) {
	const { apple } = useContext(PlayersContext);
	const [applePlayer, setApplePlayer] = apple;

	const [appleToken, setAppleToken] = useState('');

	useEffect(() => {
		if (!applePlayer) {
			setUpMusicKit(authorized, setAuthorized, setApplePlayer, setAppleToken);
		}
	}, [authorized, setAuthorized, setApplePlayer, setAppleToken, applePlayer]);

	if (authorized) {
		return <Redirect to={`/lobby?token=${appleToken}`} />;
	}
	return <></>;
}

export default AppleLogin;
