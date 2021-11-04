import React from 'react';
import './album-display.scss';
export default function AlbumDispaly({ albums }) {
	const hasAlbum = albums[0];
	return (
		<div className='albums'>
			<h1>Albums</h1>
			{hasAlbum
				? albums.map(({ albumName, artits, albumCover, id }) => (
						<div key={id} className='results-display'>
							<div className='album-cover-container'>
								<img src={albumCover} alt='' />
							</div>
							<div className='text'>
								<p className='primary'>{albumName}</p>
								<p>{artits}</p>
							</div>
							<div className='add-button'>+</div>
						</div>
				  ))
				: null}
		</div>
	);
}
