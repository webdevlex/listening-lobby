import React, { useState } from 'react';
import TrackDisplay from '../track-display/TrackDisplay';
import AlbumDispaly from '../album-display/AlbumDispaly';
import UniSearchForm from '../uni-search-form/UniSearchForm';
import './uni-search.scss';

function UniSearch({ user, buttonsClickable }) {
	const [albums, setAlbums] = useState([]);
	const [tracks, setTracks] = useState([]);

	return (
		<>
			<UniSearchForm setAlbums={setAlbums} setTracks={setTracks} user={user} />
			<div className='results'>
				<TrackDisplay
					tracks={tracks}
					user={user}
					buttonsClickable={buttonsClickable}
				/>
				<AlbumDispaly
					albums={albums}
					user={user}
					buttonsClickable={buttonsClickable}
				/>
			</div>
		</>
	);
}

export default UniSearch;
