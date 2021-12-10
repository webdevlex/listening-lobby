import React, { useEffect } from 'react';
import SpotifyPlayer from '../spotify-player/SpotifyPlayer';
import ApplePlayer from '../../components/apple-player/ApplePlayer';

function DesignatedPlayer({
	user,
	playerStatus,
	queue,
	setLoading,
	buttonsClickable,
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
		/>
	) : (
		<ApplePlayer
			user={user}
			playerStatus={playerStatus}
			queue={queue}
			buttonsClickable={buttonsClickable}
		/>
	);
}

export default DesignatedPlayer;
