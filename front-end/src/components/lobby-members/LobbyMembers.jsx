import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCrown } from '@fortawesome/free-solid-svg-icons';
import './members.scss';

function LobbyMembers({ members, adminId }) {
	return (
		<div className='lobby-members'>
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
	);
}

export default LobbyMembers;
