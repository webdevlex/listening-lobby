import React from 'react';
import SpotifyPlayer from '../spotify-player/SpotifyPlayer';
import ApplePlayer from '../../components/apple-player/ApplePlayer';

function DesignatedPlayer({ musicProvider, token, lobby_id }) {
	return musicProvider === 'spotify' ? (
		<SpotifyPlayer token={token} lobby_id={lobby_id} />
	) : (
		<ApplePlayer lobby_id={lobby_id} />
	);
}

export default DesignatedPlayer;
