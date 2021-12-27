import React from 'react';
import { Link } from 'react-router-dom';
import illustration from '../../assets/images/hero-illustration.svg';
import './hero.scss';

export default function Hero() {
	return (
		<div className='hero'>
			<div className='hero-heading-container'>
				<div className='left'>
					<div className='hero-text-container'>
						<h1 className='heading'>Listen To Music With Friends!</h1>
						<p className='sub-heading'>
							Login into your Spotify or Apple Music account, invite friends,
							and listen to your favorite songs together!
						</p>
					</div>

					<div className='button-container'>
						<Link
							className='default-button create'
							to='/choose-service?action=create'>
							Create Lobby
						</Link>
						<Link
							id='join'
							className='default-button'
							to='/choose-service?action=join'>
							Join Lobby
						</Link>
					</div>
				</div>
				<div className='right'>
					<img className='hero-illustration' src={illustration} alt='' />
				</div>
			</div>
		</div>
	);
}
