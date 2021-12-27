import React, { useEffect, useState } from 'react';
import PlaybackChangedPopup from '../../components/playback-changed/PlaybackChangedPopup';
import MaxCapPopup from '../../components/max-cap-popup/MaxCapPopup';
import Header from '../../components/header/Header';
import Hero from '../../components/hero/Hero';
import one from '../../assets/images/1.png';
import two from '../../assets/images/2.png';
import three from '../../assets/images/3.png';
import './home.scss';

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
			<Header />
			<Hero />

			<section className='home-section'>
				<div className='home-section-wrapper'>
					<div className='section-item left'>
						<img className='section-img' src={one} alt='' />
					</div>
					<div className='section-item right'>
						<h4 className='home-section-title'>
							Spotify and Apple Music compatible
						</h4>
						<p className='home-section-title-text'>
							Users can use their premium Apple Music or Spotify account in the
							same lobby to listen to their favorite music together.
						</p>
					</div>
				</div>
			</section>
			<section className='home-section reverse'>
				<div className='home-section-wrapper reverse'>
					<div className='section-item left'>
						<img className='section-img' src={two} alt='' />
					</div>
					<div className='section-item right'>
						<h4 className='home-section-title'>Easily search and add music</h4>
						<p className='home-section-title-text'>
							Using our simple search system, easily browse through Apple
							Music's and Spotify's libraries to add songs/albums to your queue.
						</p>
					</div>
				</div>
			</section>
			<section className='home-section '>
				<div className='home-section-wrapper'>
					<div className='section-item left'>
						<img className='section-img' src={three} alt='' />
					</div>
					<div className='section-item right'>
						<h4 className='home-section-title'>
							A friendly and interactive music environment
						</h4>
						<p className='home-section-title-text'>
							Add songs or albums to your personal library, send messages
							between users, and much more
						</p>
					</div>
				</div>
			</section>
		</>
	);
}

export default Home;
