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
	percent,
	setPercent,
	currentTime,
	setCurrentTime,
	shuffle,
	setShuffle,
}) {
	useEffect(() => {
		if (user.music_provider === 'apple') {
			setLoading(false);
			console.log('apple is ready');
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
			percent={percent}
			setPercent={setPercent}
			currentTime={currentTime}
			setCurrentTime={setCurrentTime}
			shuffle={shuffle}
			setShuffle={setShuffle}
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
			percent={percent}
			setPercent={setPercent}
			currentTime={currentTime}
			setCurrentTime={setCurrentTime}
			shuffle={shuffle}
			setShuffle={setShuffle}
		/>
	);
}

export default DesignatedPlayer;
