import React, { useState, useContext, useEffect } from 'react';
import DesignatedPlayer from '../../components/designated-player/DesignatedPlayer';
import LobbyMembers from '../../components/lobby-members/LobbyMembers';
import LobbyMessages from '../../components/lobby-messages/LobbyMessages';
import LobbySettings from '../../components/lobby-settings/LobbySettings';
import LobbyCenter from '../../components/lobby-center/LobbyCenter';
import SocketHandler from '../../components/socket-handler/SocketHandler';
import socketio from 'socket.io-client';
import { SocketContext } from '../../context/SocketContext';

import './lobby.scss';

function Lobby() {
	// Context
	const [socket, setSocket] = useContext(SocketContext);
	// State managament
	const [playerStatus, setPlayerStatus] = useState(null);
	const [members, setMembers] = useState([]);
	const [messages, setMessages] = useState([]);
	const [queue, setQueue] = useState([]);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [centerDisplay, setCenterDisplay] = useState('player');

	// Loaders
	const [addSongLoading, setAddSongLoading] = useState(false);

	useEffect(() => {
		if (!user) {
			const userData = JSON.parse(localStorage.getItem('user'));
			if (userData.authorized) {
				userData.authorized = false;
				localStorage.setItem('user', JSON.stringify(userData));
			} else {
				window.location.replace('http://localhost:3000');
			}
			setUser(userData);
		}

		if (!socket) {
			const url = '' || 'http://localhost:8888';
			setSocket(socketio.connect(url));
		}
	}, [setSocket, socket, user]);

	return socket ? (
		<div className='lobby'>
			<SocketHandler
				setUser={setUser}
				setMembers={setMembers}
				setMessages={setMessages}
				setQueue={setQueue}
				setPlayerStatus={setPlayerStatus}
				setAddSongLoading={setAddSongLoading}
			/>

			{!playerStatus ? (
				<h1>LOADING 1</h1>
			) : (
				<>
					<div className='player-grid'>
						<DesignatedPlayer
							user={user}
							playerStatus={playerStatus}
							queue={queue}
							setLoading={setLoading}
						/>
					</div>
					{loading ? (
						<h1>LOADING 2</h1>
					) : (
						<>
							<div className='settings-grid'>
								<LobbySettings
									lobbyId={user.lobby_id}
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
									addSongLoading={addSongLoading}
								/>
							</div>
						</>
					)}
				</>
			)}
		</div>
	) : null;
}

export default Lobby;
