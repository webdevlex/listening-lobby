import React, { useEffect, useState } from 'react';
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
	beenAdded,
}) {
	const [selected, setSelected] = useState('tracks');

	useEffect(() => {
		return () => {
			beenAdded.current = [];
		};
	}, [beenAdded]);

	return (
		<div className='search-section'>
			<UniSearchForm
				setAlbums={setAlbums}
				setTracks={setTracks}
				user={user}
				selected={selected}
				setSelected={setSelected}
			/>
			<UniSearch
				user={user}
				buttonsClickable={buttonsClickable}
				albums={albums}
				setAlbums={setAlbums}
				tracks={tracks}
				setTracks={setTracks}
				beenAdded={beenAdded}
				selected={selected}
			/>
		</div>
	);
}
