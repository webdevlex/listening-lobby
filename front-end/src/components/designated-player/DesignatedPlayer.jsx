import React, { useContext } from 'react';
import SpotifyPlayer from '../spotify-player/SpotifyPlayer';
import ApplePlayer from '../../components/apple-player/ApplePlayer';
import AppleLogin from '../apple-login/AppleLogin';
import { PlayersContext } from '../../context/PlayersContext';

function DesignatedPlayer({ user, playerStatus, queue, setLoading }) {
	const { apple } = useContext(PlayersContext);
	const [applePlayer] = apple;

	if (user.music_provider === 'spotify') {
		return (
			<SpotifyPlayer
				user={user}
				playerStatus={playerStatus}
				queue={queue}
				setLoading={setLoading}
			/>
		);
	} else {
		if (applePlayer) {
			setLoading(false);
			return (
				<ApplePlayer
					lobby_id={user.lobby_id}
					playerStatus={playerStatus}
					queue={queue}
				/>
			);
		} else {
			return <AppleLogin />;
		}
	}
}

export default DesignatedPlayer;
