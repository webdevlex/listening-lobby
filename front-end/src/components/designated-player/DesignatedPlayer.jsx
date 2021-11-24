import React, { useContext } from 'react';
import SpotifyPlayer from '../spotify-player/SpotifyPlayer';
import ApplePlayer from '../../components/apple-player/ApplePlayer';
import AppleLogin from '../apple-login/AppleLogin';
import { PlayersContext } from '../../context/PlayersContext';

function DesignatedPlayer({ musicProvider, token, lobby_id }) {
	const { apple } = useContext(PlayersContext);
	const [applePlayer] = apple;

	if (musicProvider === 'spotify') {
		return <SpotifyPlayer token={token} lobby_id={lobby_id} />;
	} else {
		return applePlayer ? <ApplePlayer lobby_id={lobby_id} /> : <AppleLogin />;
	}
}

export default DesignatedPlayer;
