import React from 'react';

function Members({ members }) {
	return (
		<div>
			<h4>Members</h4>
			{members.map((member) => {
				return <p key={member}>{member}</p>;
			})}
		</div>
	);
}

export default Members;
