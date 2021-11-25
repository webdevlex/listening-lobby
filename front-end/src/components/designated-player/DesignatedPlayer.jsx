import React, { useContext } from 'react';
import SpotifyPlayer from '../spotify-player/SpotifyPlayer';
import ApplePlayer from '../../components/apple-player/ApplePlayer';
import AppleLogin from '../apple-login/AppleLogin';
import { PlayersContext } from '../../context/PlayersContext';

function DesignatedPlayer({ musicProvider, lobby_id, playerStatus }) {
	const { apple } = useContext(PlayersContext);
	const [applePlayer] = apple;

	if (musicProvider === 'spotify') {
		return <SpotifyPlayer lobby_id={lobby_id} playerStatus={playerStatus} />;
	} else {
		return applePlayer ? (
			<ApplePlayer lobby_id={lobby_id} playerStatus={playerStatus} />
		) : (
			<AppleLogin />
		);
	}
}

export default DesignatedPlayer;
