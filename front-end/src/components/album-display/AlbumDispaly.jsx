import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import './album-display.scss';
import LoadingSpinner from '../loading-spinner/LoadingSpinner';

export default function AlbumDispaly({
	albums,
	user,
	buttonsClickable,
	beenAdded,
	searchLoading,
	setArtistSearch,
}) {
	const [socket] = useContext(SocketContext);

	function handleAlbumClick(albumData) {
		socket.emit('addAlbum', { albumData, user });
	}
	//TEMPORARY BUG FIX
	let hasAlbum = albums === undefined ? false : albums[0];

	function handleArtistClick(searchValue) {
		setArtistSearch(searchValue);
		socket.emit('artistSearch', { searchValue, user });
	}

	function handleAlbumNameClick(album) {
		// socket.emit('getAlbumTracks', { album, user });
	}

	return (
		<div className='search-albums-display'>
			{!searchLoading ? (
				hasAlbum ? (
					albums.map((album, index) => (
						<div
							key={index}
							className='results-display'
							onDoubleClick={() => handleAlbumClick(album)}>
							<div className='album-cover-container'>
								<img src={album.albumCover} alt='' />
							</div>
							<div className='text'>
								<p
									className='title album-name'
									onClick={() => handleAlbumNameClick(album)}>
									{album.albumName}
								</p>
								<div className='all-artists'>
									{album.artists.split(',').map((artist, index) => (
										<p
											key={index}
											className='simple-text artists'
											onClick={() => handleArtistClick(artist)}>
											{artist}
										</p>
									))}
								</div>
							</div>

							<div className='search-result-action-icon'>
								{buttonsClickable ? (
									beenAdded.current.includes(album.id) ? (
										<FontAwesomeIcon className='check-icon' icon={faCheck} />
									) : (
										<div
											className='add-button'
											onClick={() => handleAlbumClick(album)}>
											+
										</div>
									)
								) : (
									<LoadingSpinner />
								)}
							</div>
						</div>
					))
				) : (
					<p className='simple-text'>No Results . . .</p>
				)
			) : (
				<LoadingSpinner />
			)}
		</div>
	);
}
