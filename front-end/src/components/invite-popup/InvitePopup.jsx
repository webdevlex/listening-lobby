import React, { useState } from 'react';
import './invite-popup.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function InvitePopup({
	displayInvitePopup,
	setDisplayInvitePopup,
	user,
}) {
	const [copied, setCopied] = useState(false);
	const link = `http://localhost:3000/choose-service?action=join&lobby_id=${user.lobby_id}`;
	const [inputValue] = useState(link);

	function handleOutsideClick(e) {
		if (e.target.className === 'popup') {
			setDisplayInvitePopup(false);
			setCopied(false);
		}
	}

	return displayInvitePopup ? (
		<div
			className='popup'
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
