import React, { useState } from 'react';
import TrackDisplay from '../track-display/TrackDisplay';
import AlbumDispaly from '../album-display/AlbumDispaly';

import './uni-search.scss';

function UniSearch({ user, buttonsClickable, albums, tracks }) {
	const [addedToQueue, setAddedToQueue] = useState([]);

	return (
		<div className='results'>
			<TrackDisplay
				tracks={tracks}
				user={user}
				buttonsClickable={buttonsClickable}
				addedToQueue={addedToQueue}
				setAddedToQueue={setAddedToQueue}
			/>
			<AlbumDispaly
				albums={albums}
				user={user}
				buttonsClickable={buttonsClickable}
				addedToQueue={addedToQueue}
				setAddedToQueue={setAddedToQueue}
			/>
		</div>
	);
}

export default UniSearch;
