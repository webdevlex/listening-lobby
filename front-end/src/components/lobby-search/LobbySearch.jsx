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
	searchLoading,
	setSearchLoading,
	searchTabSelected,
	setSearchTabSelected,
}) {
	const [artistSearch, setArtistSearch] = useState(null);

	useEffect(() => {
		return () => {
			beenAdded.current = [];
		};
	}, [beenAdded, searchTabSelected, setSearchTabSelected]);

	return (
		<div className='search-section'>
			<UniSearchForm
				setAlbums={setAlbums}
				setTracks={setTracks}
				user={user}
				searchTabSelected={searchTabSelected}
				setSearchTabSelected={setSearchTabSelected}
				setSearchLoading={setSearchLoading}
				artistSearch={artistSearch}
				setArtistSearch={setArtistSearch}
			/>
			<UniSearch
				user={user}
				buttonsClickable={buttonsClickable}
				albums={albums}
				setAlbums={setAlbums}
				tracks={tracks}
				setTracks={setTracks}
				beenAdded={beenAdded}
				searchTabSelected={searchTabSelected}
				searchLoading={searchLoading}
				artistSearch={artistSearch}
				setArtistSearch={setArtistSearch}
			/>
		</div>
	);
}
