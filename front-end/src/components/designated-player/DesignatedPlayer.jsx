import React, { useContext } from 'react';
import SpotifyPlayer from '../spotify-player/SpotifyPlayer';
import ApplePlayer from '../../components/apple-player/ApplePlayer';
import AppleLogin from '../apple-login/AppleLogin';
import { AppleMusicContext } from '../../context/AppleMusicContext';

function DesignatedPlayer({ musicProvider, token, lobby_id }) {
	const [musicKit] = useContext(AppleMusicContext);

	if (musicProvider === 'spotify') {
		return <SpotifyPlayer token={token} lobby_id={lobby_id} />;
	} else {
		return musicKit ? (
			<ApplePlayer lobby_id={lobby_id} />
		) : (
			<AppleLogin />
		);
	}
}

export default DesignatedPlayer;
