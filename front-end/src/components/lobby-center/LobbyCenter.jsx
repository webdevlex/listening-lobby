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
}) {
	switch (centerDisplay) {
		case 'player':
			return (
				<>
					<LobbyTrackDisplay queue={queue} />
					<div className='lobby-queue-wrapper'>
						<LobbyQueue
							queue={queue}
							user={user}
							buttonsClickable={buttonsClickable}
							likedSongs={likedSongs}
							setLikedSongs={setLikedSongs}
							playing={playing}
						/>
					</div>
				</>
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
				/>
			);
		case 'invite':
			return <h1>invite</h1>;
		case 'settings':
			return <h1>settings</h1>;
		default:
			return null;
	}
}
