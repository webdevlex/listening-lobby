import React from 'react';
import useWindowSize from '../../hooks/hooks';
import TrackDisplay from '../track-display/TrackDisplay';
import AlbumDispaly from '../album-display/AlbumDispaly';

import './uni-search.scss';

function UniSearch({
	user,
	buttonsClickable,
	albums,
	tracks,
	beenAdded,
	searchTabSelected,
	searchLoading,
	setArtistSearch,
}) {
	const [width] = useWindowSize();

	return (
		<div className='results'>
			{(width < 1000 && searchTabSelected === 'tracks') || width > 1000 ? (
				<TrackDisplay
					tracks={tracks}
					user={user}
					buttonsClickable={buttonsClickable}
					beenAdded={beenAdded}
					searchLoading={searchLoading}
					setArtistSearch={setArtistSearch}
				/>
			) : null}
			{(width < 1000 && searchTabSelected === 'albums') || width > 1000 ? (
				<AlbumDispaly
					albums={albums}
					user={user}
					buttonsClickable={buttonsClickable}
					beenAdded={beenAdded}
					searchLoading={searchLoading}
					setArtistSearch={setArtistSearch}
				/>
			) : null}
		</div>
	);
}

export default UniSearch;
