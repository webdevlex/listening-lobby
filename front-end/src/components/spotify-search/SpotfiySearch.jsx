import React, { useState } from 'react';

import TrackDisplay from '../track-display/TrackDisplay';
import AlbumDispaly from '../album-display/AlbumDispaly';
import SpotifySearchForm from '../spotify-search-form/SpotifySearchForm';
import './spotify-search.scss';

export default function SpotfiySearch() {
	const [albums, setAlbums] = useState([]);
	const [tracks, setTracks] = useState([]);

	return (
		<>
			<SpotifySearchForm
				setAlbums={setAlbums}
				setTracks={setTracks}
			/>
			<div className='results'>
				<TrackDisplay tracks={tracks} />
				<AlbumDispaly albums={albums} />
			</div>
		</>
	);
}
