import React from 'react';

function LobbyMembers({ members }) {
	return (
		<div>
			<h4>Members</h4>
			{members.map((member, index) => {
				return <p key={index}>{member}</p>;
			})}
		</div>
	);
}

export default LobbyMembers;
