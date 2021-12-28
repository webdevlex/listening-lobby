import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo-with-text.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import useWindowSize from '../../hooks/hooks';
import xmark from '../../assets/images/xmark-solid.svg';
import './header.scss';

export default function Header() {
	const [width] = useWindowSize();
	const [menuOpen, setMenuOpen] = useState(false);

	function handleClick(e) {
		const linkClicked = e.target.className === 'nav-link';
		if (linkClicked) closeMenu();
	}

	function openMenu() {
		setMenuOpen(true);
		document.body.style.overflow = 'hidden';
	}
	function closeMenu() {
		setMenuOpen(false);
		document.body.style.overflow = 'auto';
	}

	return (
		<header className='header'>
			<div className='header-wrapper'>
				<Link to='/'>
					<img className='logo' src={logo} alt='' />
				</Link>

				{menuOpen || width > 800 ? (
					<ul className='nav' onClick={(e) => handleClick(e)}>
						{width < 800 ? (
							<button className='close-menu-button' onClick={() => closeMenu()}>
								<img className='x-icon' src={xmark} alt='' />
							</button>
						) : null}
						<Link className='nav-link' to='/'>
							Home
						</Link>
						<Link className='nav-link' to='/'>
							Donate
						</Link>
						<Link className='nav-link' to='/choose-service?action=create'>
							Create Lobby
						</Link>
						<Link className='nav-link' to='/choose-service?action=join'>
							Join Lobby
						</Link>
					</ul>
				) : (
					<button className='mobile-menu-button' onClick={() => openMenu()}>
						<FontAwesomeIcon className='menu-icon' icon={faBars} />
					</button>
				)}
			</div>
		</header>
	);
}
