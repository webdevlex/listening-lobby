import React, { useState } from 'react';
import DesignatedPlayer from '../../components/designated-player/DesignatedPlayer';
import Members from '../../components/members/Members';
import Messages from '../../components/messages/Messages';
import MessagesForm from '../../components/messages-form/MessagesForm';
import SocketHandler from '../../components/socket-handler/SocketHandler';

function Lobby() {
	// Local storage data
	const { username, music_provider, lobby_id } = JSON.parse(
		localStorage.getItem('user')
	);

	// State managament
	const [members, setMembers] = useState([]);
	const [messages, setMessages] = useState([]);
	const [playlist, setPlaylist] = useState([]);
	const [user, setUser] = useState({
		username,
		music_provider,
		lobby_id,
	});

	return (
		<div>
			<h4>Lobby Id</h4>
			<p>{user.lobby_id}</p>
			<SocketHandler
				setUser={setUser}
				setMembers={setMembers}
				setMessages={setMessages}
				setPlaylist={setPlaylist}
			/>
			<DesignatedPlayer
				musicProvider={user.music_provider}
				lobby_id={user.lobby_id}
			/>
			<Members members={members} />
			<Messages messages={messages} />
			<MessagesForm user={user} />
		</div>
	);
}

export default Lobby;
