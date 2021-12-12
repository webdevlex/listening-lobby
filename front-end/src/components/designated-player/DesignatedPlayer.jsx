import React, { useEffect } from 'react';
import SpotifyPlayer from '../spotify-player/SpotifyPlayer';
import ApplePlayer from '../../components/apple-player/ApplePlayer';

function DesignatedPlayer({
	user,
	playerStatus,
	queue,
	setLoading,
	buttonsClickable,
	loading,
}) {
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
			buttonsClickable={buttonsClickable}
			loading={loading}
		/>
	) : (
		<ApplePlayer
			user={user}
			playerStatus={playerStatus}
			queue={queue}
			buttonsClickable={buttonsClickable}
			loading={loading}
		/>
	);
}

export default DesignatedPlayer;
