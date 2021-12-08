import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import './album-display.scss';

export default function AlbumDispaly({ albums, user, addSongLoading }) {
	const [socket] = useContext(SocketContext);

	function handleAlbumClick(albumData) {
		socket.emit('addAlbum', { albumData, user });
	}
	//TEMPORARY BUG FIX
	let hasAlbum = albums === undefined ? false : albums[0];

	return (
		<div className='albums'>
			<h1>Albums</h1>
			{hasAlbum
				? albums.map((album) => (
						<div key={album.id} className='results-display'>
							<div className='album-cover-container'>
								<img src={album.albumCover} alt='' />
							</div>
							<div className='text'>
								<p className='primary'>{album.albumName}</p>
								<p>{album.artists}</p>
							</div>
							{!addSongLoading ? (
								<div
									className='add-button'
									onClick={() => handleAlbumClick(album)}>
									+
								</div>
							) : (
								<div className='loading'>loading</div>
							)}
						</div>
				  ))
				: null}
		</div>
	);
}
