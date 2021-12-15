import React from 'react';
import QueueTrack from '../queue-track/QueueTrack';
import './lobby-queue.scss';

export default function LobbyQueue({
	queue,
	user,
	buttonsClickable,
	likedSongs,
	setLikedSongs,
	playing,
}) {
	const queueHasItems = queue[0];

	return (
		<div className='lobby-queue'>
			{queueHasItems &&
				queue.map((song, index) => (
					<QueueTrack
						song={song}
						index={index}
						buttonsClickable={buttonsClickable}
						setLikedSongs={setLikedSongs}
						likedSongs={likedSongs}
						user={user}
						playing={playing}
					/>
				))}
		</div>
	);
}
