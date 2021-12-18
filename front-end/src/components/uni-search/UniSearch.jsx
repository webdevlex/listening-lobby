import React from 'react';
import TrackDisplay from '../track-display/TrackDisplay';
import AlbumDispaly from '../album-display/AlbumDispaly';

import './uni-search.scss';

function UniSearch({ user, buttonsClickable, albums, tracks, addedToQueue }) {
	return (
		<div className='results'>
			<TrackDisplay
				tracks={tracks}
				user={user}
				buttonsClickable={buttonsClickable}
				addedToQueue={addedToQueue}
			/>
			<AlbumDispaly
				albums={albums}
				user={user}
				buttonsClickable={buttonsClickable}
				addedToQueue={addedToQueue}
			/>
		</div>
	);
}

export default UniSearch;
