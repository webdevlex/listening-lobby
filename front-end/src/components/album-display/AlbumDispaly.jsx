import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import './album-display.scss';

export default function AlbumDispaly({
	albums,
	user,
	buttonsClickable,
	addedToQueue,
	setAddedToQueue,
}) {
	const [socket] = useContext(SocketContext);

	function handleAlbumClick(albumData) {
		setAddedToQueue([...addedToQueue, albumData.id]);
		socket.emit('addAlbum', { albumData, user });
	}
	//TEMPORARY BUG FIX
	let hasAlbum = albums === undefined ? false : albums[0];

	return (
		<div className='search-albums-display'>
			{hasAlbum
				? albums.map((album) => (
						<div key={album.id} className='results-display'>
							<div className='album-cover-container'>
								<img src={album.albumCover} alt='' />
							</div>
							<div className='text'>
								<p className='title'>{album.albumName}</p>
								<p className='simple-text artists'>{album.artists}</p>
							</div>
							<div className='search-result-action-icon'>
								{buttonsClickable ? (
									addedToQueue.includes(album.id) ? (
										<FontAwesomeIcon className='check-icon' icon={faCheck} />
									) : (
										<div
											className='add-button'
											onClick={() => handleAlbumClick(album)}>
											+
										</div>
									)
								) : (
									<div className='loading'>loading</div>
								)}
							</div>
						</div>
				  ))
				: null}
		</div>
	);
}
