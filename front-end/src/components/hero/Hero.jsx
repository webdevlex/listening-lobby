import React from 'react';
import { Link } from 'react-router-dom';
import './hero.scss';

export default function Hero() {
	return (
		<div className='hero'>
			<div className='hero-heading-container'>
				<div className='text-container'>
					<h1>Listening Lobby</h1>
					<p>Relax and listen to music with friends!</p>
					<div className='button-container'>
						<Link className='link' to='/choose-service?action=create'>
							New Lobby
						</Link>
						<Link className='link' to='/choose-service?action=join'>
							Join Lobby
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
