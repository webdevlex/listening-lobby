import React, { useEffect, useState } from 'react';
import PlaybackChangedPopup from '../../components/playback-changed/PlaybackChangedPopup';
import MaxCapPopup from '../../components/max-cap-popup/MaxCapPopup';
import Hero from '../../components/hero/Hero';

function Home() {
	const [maxReached, setMaxReached] = useState(false);
	const [playbackChanged, setPlaybackChanged] = useState(false);

	useEffect(() => {
		const capacity = JSON.parse(localStorage.getItem('capacity')) || {
			maxReached: false,
		};
		const playback = JSON.parse(localStorage.getItem('playback')) || {
			changed: false,
		};

		if (capacity.maxReached) {
			setMaxReached(true);
			localStorage.setItem('capacity', JSON.stringify({ maxReached: false }));
		}
		if (playback.changed) {
			setPlaybackChanged(true);
			localStorage.setItem('playback', JSON.stringify({ changed: false }));
		}
	}, []);

	return (
		<>
			<PlaybackChangedPopup
				playbackChanged={playbackChanged}
				setPlaybackChanged={setPlaybackChanged}
			/>
			<MaxCapPopup maxReached={maxReached} setMaxReached={setMaxReached} />
			<Hero />
		</>
	);
}

export default Home;
