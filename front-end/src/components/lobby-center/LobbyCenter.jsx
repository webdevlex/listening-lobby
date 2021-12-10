import React from 'react';
import LobbyTrackDisplay from '../lobby-track-display/LobbyTrackDisplay';
import LobbyQueue from '../lobby-queue/LobbyQueue';
import LobbySearch from '../lobby-search/LobbySearch';

export default function LobbyCenter({
	centerDisplay,
	queue,
	user,
	buttonsClickable,
	likedSongs,
	setLikedSongs,
	albums,
	setAlbums,
	tracks,
	setTracks,
}) {
	return centerDisplay === 'player' ? (
		<>
			<LobbyTrackDisplay />
			<LobbyQueue
				queue={queue}
				user={user}
				buttonsClickable={buttonsClickable}
				likedSongs={likedSongs}
				setLikedSongs={setLikedSongs}
			/>
		</>
	) : (
		<LobbySearch
			user={user}
			buttonsClickable={buttonsClickable}
			albums={albums}
			setAlbums={setAlbums}
			tracks={tracks}
			setTracks={setTracks}
		/>
	);
}
