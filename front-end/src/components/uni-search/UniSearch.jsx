import React from 'react';
import TrackDisplay from '../track-display/TrackDisplay';
import AlbumDispaly from '../album-display/AlbumDispaly';

import './uni-search.scss';

function UniSearch({ user, buttonsClickable, albums, tracks }) {
	return (
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
	);
}

export default UniSearch;
