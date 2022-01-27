import React, { useState, useEffect } from 'react';
import './invite-popup.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import useWindowSize from '../../hooks/hooks';

export default function InvitePopup({
	displayInvitePopup,
	setDisplayInvitePopup,
	user,
}) {
	const lobby_id = user.lobby_id || '';
	const [width] = useWindowSize();
	const [copied, setCopied] = useState(false);

	const url =
		process.env.NODE_ENV === 'production'
			? `www.listeninglobby.com/choose-service?action=join&lobby_id=${lobby_id}`
			: `http://localhost:3000/choose-service?action=join&lobby_id=${lobby_id}`;
	const [inputValue] = useState(url);

	useEffect(() => {
		return () => {
			setCopied(false);
		};
	}, []);

	function handleOutsideClick(e) {
		if (e.target.className === 'invite-popup' && width > 850) {
			setDisplayInvitePopup(false);
			setCopied(false);
		}
	}

	return displayInvitePopup ? (
		<div
			className='invite-popup'
			onClick={(e) => {
				handleOutsideClick(e);
			}}>
			<div className='invite-container'>
				<div className='lobby-id-container'>
					<p className='lobby-id-title'>Lobby ID: </p>
					<p className='lobby-id'>{user.lobby_id}</p>
				</div>
				<div className={`invite-link ${copied ? 'green' : null}`}>
					<FontAwesomeIcon className='link-icon' icon={faLink} />
					<input type='text' readOnly={true} defaultValue={link} />
					<CopyToClipboard text={inputValue}>
						<button
							onClick={() => {
								setCopied(true);
							}}>
							{copied ? 'copied' : 'copy'}
						</button>
					</CopyToClipboard>
				</div>
			</div>
		</div>
	) : null;
}
