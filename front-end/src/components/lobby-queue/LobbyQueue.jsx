import React, { useContext } from 'react';
import './lobby-queue.scss';
import { PlayersContext } from '../../context/PlayersContext';
import { SocketContext } from '../../context/SocketContext';

export default function LobbyQueue({
	queue,
	user,
	buttonsClickable,
	likedSongs,
	setLikedSongs,
}) {
	const { apple } = useContext(PlayersContext);
	const [applePlayer] = apple;
	const queueHasItems = queue[0];
	const [socket] = useContext(SocketContext);

	async function addSongToLibrary(spotifySong, appleSong, id) {
		setLikedSongs([...likedSongs, id]);
		if (user.music_provider === 'apple') {
			await applePlayer.addToLibrary(appleSong);
		} else {
			socket.emit('likeSong', { spotifySong, user });
		}
	}

	function remove(index) {
		socket.emit('remove', { lobby_id: user.lobby_id, index });
	}

	return (
		<div className='lobby-queue'>
			<h1>Queue</h1>
			{queueHasItems &&
				queue.map(({ ui, apple, spotify }, index) => (
					<div className='queue-item' key={index}>
						<p className='index'>{index + 1}</p>
						<div className='primary-info'>
							<div className='album-cover-container'>
								<img src={ui.trackCover} alt='' />
							</div>
							<div className='text'>
								<p className='primary-text'>{ui.trackName}</p>
								<p>{ui.artists}</p>
							</div>
						</div>

						{apple === '-1' ? <p style={{ color: 'red' }}>no apple</p> : null}
						{spotify === '-1' ? (
							<p style={{ color: 'red' }}>no spotify</p>
						) : null}

						{buttonsClickable ? (
							<p className='remove-button' onClick={() => remove(index)}>
								remove
							</p>
						) : (
							<p>loading</p>
						)}

						{buttonsClickable ? (
							likedSongs.includes(ui.uniId) ? (
								<p>check mark</p>
							) : (
								<p
									className='add-to-library-button'
									onClick={() => {
										addSongToLibrary(spotify, apple, ui.uniId);
									}}>
									add to library
								</p>
							)
						) : (
							<p>loading</p>
						)}
					</div>
				))}
		</div>
	);
}
