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
							Create an invite-only place where you belong
						</h4>
						<p className='home-section-title-text'>
							Discord servers are organized into topic-based channels where you
							can collaborate, share, and just talk about your day without
							clogging up a group chat.
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
						<h4 className='home-section-title'>Where hanging out is easy</h4>
						<p className='home-section-title-text'>
							Grab a seat in a voice channel when you’re free. Friends in your
							server can see you’re around and instantly pop in to talk without
							having to call.
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
						<h4 className='home-section-title'>From few to a fandom</h4>
						<p className='home-section-title-text'>
							Get any community running with moderation tools and custom member
							access. Give members special powers, set up private channels, and
							more.
						</p>
					</div>
				</div>
			</section>
		</>
	);
}

export default Home;
