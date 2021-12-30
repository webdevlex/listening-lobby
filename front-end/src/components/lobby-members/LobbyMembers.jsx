import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCrown } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/images/gray-logo-with-text.svg';
import './members.scss';

function LobbyMembers({ members, adminId }) {
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

			<div className='lobby-logo-container'>
				<img className='lobby-logo' src={logo} alt='' />
			</div>
		</div>
	);
}

export default LobbyMembers;
