import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import './members.scss';

function LobbyMembers({ members }) {
	return (
		<div>
			<h4 className='section-title'>Members</h4>
			{members.map((member, index) => {
				return (
					<div className='member-display'>
						<FontAwesomeIcon className='member-icon' icon={faUser} />
						<p key={index}>{member}</p>
					</div>
				);
			})}
		</div>
	);
}

export default LobbyMembers;
