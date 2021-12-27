import React from 'react';
import { Link } from 'react-router-dom';
import temp from '../../assets/images/temp.png';
import './hero.scss';

export default function Hero() {
	return (
		<div className='hero'>
			<div className='hero-heading-container'>
				<div className='left'>
					<h1>Listen To Music Width Friends!</h1>
					<div className='button-container'>
						<Link className='link create' to='/choose-service?action=create'>
							Create Lobby
						</Link>
						<Link className='link join' to='/choose-service?action=join'>
							Join Lobby
						</Link>
					</div>
				</div>
				<div className='right'>
					<img className='hero-illustration' src={temp} alt='' />
				</div>
			</div>
		</div>
	);
}
