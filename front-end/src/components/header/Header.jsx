import React from 'react';
import logo from '../../assets/images/Logo-With-Text.svg';
import './header.scss';

export default function Header() {
	return (
		<header className='header'>
			<div className='header-wrapper'>
				<img className='logo' src={logo} alt='' />
			</div>
		</header>
	);
}
