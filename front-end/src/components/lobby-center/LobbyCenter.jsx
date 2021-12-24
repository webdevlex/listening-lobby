import React from 'react';
import LobbyTrackDisplay from '../lobby-track-display/LobbyTrackDisplay';
import LobbyQueue from '../lobby-queue/LobbyQueue';
import LobbySearch from '../lobby-search/LobbySearch';
import './lobby-center.scss';

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
	playing,
	beenAdded,
	searchLoading,
	setSearchLoading,
	percent,
	currentTime,
}) {
	switch (centerDisplay) {
		case 'player':
			return (
				<div className='lobby-center-queue-wrapper'>
					<LobbyTrackDisplay
						queue={queue}
						percent={percent}
						currentTime={currentTime}
					/>
					<LobbyQueue
						queue={queue}
						user={user}
						buttonsClickable={buttonsClickable}
						likedSongs={likedSongs}
						setLikedSongs={setLikedSongs}
						playing={playing}
					/>
				</div>
			);
		case 'search':
			return (
				<LobbySearch
					user={user}
					buttonsClickable={buttonsClickable}
					albums={albums}
					setAlbums={setAlbums}
					tracks={tracks}
					setTracks={setTracks}
					beenAdded={beenAdded}
					searchLoading={searchLoading}
					setSearchLoading={setSearchLoading}
				/>
			);
		case 'settings':
			return <h1>settings</h1>;
		default:
			return null;
	}
}
