import React from 'react';
import LobbyTrackDisplay from '../lobby-track-display/LobbyTrackDisplay';
import LobbyQueue from '../lobby-queue/LobbyQueue';
import LobbySearch from '../lobby-search/LobbySearch';

export default function LobbyCenter({ centerDisplay, queue, user }) {
	return centerDisplay === 'player' ? (
		<>
			<LobbyTrackDisplay />
			<LobbyQueue queue={queue} />
		</>
	) : (
		<LobbySearch user={user} />
	);
}
