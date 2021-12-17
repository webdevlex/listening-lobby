import React from 'react';
import UniSearch from '../uni-search/UniSearch';
import UniSearchForm from '../uni-search-form/UniSearchForm';
import './lobby-search.scss';

export default function LobbySearch({
	user,
	buttonsClickable,
	albums,
	setAlbums,
	tracks,
	setTracks,
}) {
	return (
		<div className='search-section'>
			<UniSearchForm setAlbums={setAlbums} setTracks={setTracks} user={user} />
			<UniSearch
				user={user}
				buttonsClickable={buttonsClickable}
				albums={albums}
				setAlbums={setAlbums}
				tracks={tracks}
				setTracks={setTracks}
			/>
		</div>
	);
}
