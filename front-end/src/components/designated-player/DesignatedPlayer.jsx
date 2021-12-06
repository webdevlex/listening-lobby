import React, { useEffect } from 'react';
import SpotifyPlayer from '../spotify-player/SpotifyPlayer';
import ApplePlayer from '../../components/apple-player/ApplePlayer';

function DesignatedPlayer({ user, playerStatus, queue, setLoading }) {
	useEffect(() => {
		if (user.music_provider === 'apple') {
			setLoading(false);
		}
	}, [user, setLoading]);

	return user.music_provider === 'spotify' ? (
		<SpotifyPlayer
			user={user}
			playerStatus={playerStatus}
			queue={queue}
			setLoading={setLoading}
		/>
	) : (
		<ApplePlayer
			lobby_id={user.lobby_id}
			playerStatus={playerStatus}
			queue={queue}
		/>
	);
}

export default DesignatedPlayer;
