import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/Logo-With-Text.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import useWindowSize from "../../hooks/hooks";
import xmark from "../../assets/images/xmark-solid.svg";
import "./header.scss";

export default function Header() {
  const [width] = useWindowSize();
  const [menuOpen, setMenuOpen] = useState(false);

  function openMenu() {
    setMenuOpen(true);
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    setMenuOpen(false);
    document.body.style.overflow = "auto";
  }

  return (
    <header className='header'>
      <div className='header-wrapper'>
        <Link to='/'>
          <img className='logo' src={logo} alt='' />
        </Link>

        {menuOpen || width > 800 ? (
          <ul className='nav'>
            {width < 800 ? (
              <button className='close-menu-button' onClick={() => closeMenu()}>
                <img className='x-icon' src={xmark} alt='' />
              </button>
            ) : null}
            <li className='nav-link'>Home</li>
            <li className='nav-link'>Donate</li>
            {/* <li className='nav-link'>Contact</li> */}
            <li className='nav-link'>Create Lobby</li>
            <li className='nav-link'>Join Lobby</li>
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
