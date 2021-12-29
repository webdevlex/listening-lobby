import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo-and-text.svg';
import './footer.scss';

export default function Footer() {
	return (
		<div className='footer'>
			<div className='footer-container'>
				<div className='footer-top'>
					<div className='footer-text'>
						<h1 className='footer-heading'>Ready to start your journey?</h1>
						<p className='footer-sub-heading'>
							Login into your premium Spotify or Apple Music account and listen
							to your favorite music together!
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
				<div className='footer-bottom'>
					<div className='footer-logo-container'>
						<img className='footer-logo' src={logo} alt='' />
					</div>
					<p className='copyright-text'>Copyright © 2021 Listening Lobby</p>
				</div>
			</div>
		</div>
	);
}
