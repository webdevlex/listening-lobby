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
	selected,
	searchLoading,
}) {
	const [width] = useWindowSize();

	return (
		<div className='results'>
			{(width < 1000 && selected === 'tracks') || width > 1000 ? (
				<TrackDisplay
					tracks={tracks}
					user={user}
					buttonsClickable={buttonsClickable}
					beenAdded={beenAdded}
					searchLoading={searchLoading}
				/>
			) : null}
			{(width < 1000 && selected === 'albums') || width > 1000 ? (
				<AlbumDispaly
					albums={albums}
					user={user}
					buttonsClickable={buttonsClickable}
					beenAdded={beenAdded}
					searchLoading={searchLoading}
				/>
			) : null}
		</div>
	);
}

export default UniSearch;
