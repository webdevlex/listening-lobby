import React, { useState } from 'react';
import DesignatedPlayer from '../../components/designated-player/DesignatedPlayer';
import LobbyMembers from '../../components/lobby-members/LobbyMembers';
import LobbyMessages from '../../components/lobby-messages/LobbyMessages';
import LobbySettings from '../../components/lobby-settings/LobbySettings';
import LobbyCenter from '../../components/lobby-center/LobbyCenter';
import SocketHandler from '../../components/socket-handler/SocketHandler';
import './lobby.scss';

function Lobby() {
	// Local storage data
	const { username, music_provider, lobby_id } = JSON.parse(
		localStorage.getItem('user')
	);

	// State managament
	const [members, setMembers] = useState([]);
	const [messages, setMessages] = useState([]);
	const [queue, setQueue] = useState([]);
	const [user, setUser] = useState({
		username,
		music_provider,
		lobby_id,
	});
	const [centerDisplay, setCenterDisplay] = useState('player');

	return (
		<div className='lobby'>
			{/* <h4>Lobby Id</h4>
			<p>{user.lobby_id}</p> */}
			<SocketHandler
				setUser={setUser}
				setMembers={setMembers}
				setMessages={setMessages}
				setQueue={setQueue}
			/>
			<div className='settings-grid'>
				<LobbySettings
					centerDisplay={centerDisplay}
					setCenterDisplay={setCenterDisplay}
				/>
			</div>
			<div className='members-grid'>
				<LobbyMembers members={members} />
			</div>
			<div className='messages-grid'>
				<LobbyMessages messages={messages} user={user} />
			</div>
			<div className='center-grid'>
				<LobbyCenter
					centerDisplay={centerDisplay}
					queue={queue}
					user={user}
				/>
			</div>
			<div className='player-grid'>
				<DesignatedPlayer
					musicProvider={user.music_provider}
					lobby_id={user.lobby_id}
				/>
			</div>
		</div>
	);
}

export default Lobby;
