import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCrown } from '@fortawesome/free-solid-svg-icons';
import useWindowSize from '../../hooks/hooks';
import InvitePopup from '../invite-popup/InvitePopup';
import logo from '../../assets/images/gray-logo-with-text.svg';

import './members.scss';

function LobbyMembers({
	members,
	adminId,
	displayInvitePopup,
	setDisplayInvitePopup,
	user,
}) {
	const [width] = useWindowSize();

	return (
		<div className='lobby-members'>
			<div className='members-container'>
				<h4 className='section-title'>Members</h4>
				{members.map((member, index) => {
					return (
						<div className='member-display' key={index}>
							<FontAwesomeIcon className='member-icon' icon={faUser} />
							<p>{member.username}</p>
							{adminId === member.user_id ? (
								<FontAwesomeIcon className='crown-icon' icon={faCrown} />
							) : null}
						</div>
					);
				})}
			</div>

			<div>
				{width < 850 ? (
					<InvitePopup
						displayInvitePopup={displayInvitePopup}
						setDisplayInvitePopup={setDisplayInvitePopup}
						user={user}
					/>
				) : (
					<div className='lobby-logo-container'>
						<img className='lobby-logo' src={logo} alt='' />
					</div>
				)}
			</div>
		</div>
	);
}

export default LobbyMembers;
