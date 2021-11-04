import React, { useContext } from 'react';
import { SocketContext } from '../../context/socketContext';
import './album-display.scss';

export default function AlbumDispaly({ albums }) {
	const socket = useContext(SocketContext);

	function handleSongClick(album) {
		socket.emit('addSongToQueue', album);
	}

	const hasAlbum = albums[0];
	return (
		<div className='albums'>
			<h1>Albums</h1>
			{hasAlbum
				? albums.map(
						({ albumName, artists, albumCover, id, songCount }) => (
							<div
								key={id}
								className='results-display'
								onClick={() =>
									handleSongClick({
										albumName,
										artists,
										id,
										songCount,
									})
								}>
								<div className='album-cover-container'>
									<img src={albumCover} alt='' />
								</div>
								<div className='text'>
									<p className='primary'>{albumName}</p>
									<p>{artists}</p>
								</div>
								<div className='add-button'>+</div>
							</div>
						)
				  )
				: null}
		</div>
	);
}
