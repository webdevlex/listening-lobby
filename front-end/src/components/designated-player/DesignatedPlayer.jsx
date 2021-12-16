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
	setPlaying,
	playing,
	likedSongs,
	setLikedSongs,
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
			setPlaying={setPlaying}
			playing={playing}
			likedSongs={likedSongs}
			setLikedSongs={setLikedSongs}
		/>
	) : (
		<ApplePlayer
			user={user}
			playerStatus={playerStatus}
			queue={queue}
			buttonsClickable={buttonsClickable}
			loading={loading}
			likedSongs={likedSongs}
			setLikedSongs={setLikedSongs}
			setPlaying={setPlaying}
			playing={playing}
		/>
	);
}

export default DesignatedPlayer;
