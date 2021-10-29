import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../../context/socketContext';

function SocketHandler({
	setUser,
	setMembers,
	setMessages,
	setPlaylist,
}) {
	const params = new URLSearchParams(window.location.search);
	const token = params.get('token');
	const refresh_token = params.get('refresh_token');
	const socket = useContext(SocketContext);

	useEffect(() => {
		const localStorageData = JSON.parse(localStorage.getItem('user'));
		setUser(localStorageData);

		socket.emit('joinLobby', {
			lobby_id: localStorageData.lobby_id,
			username: localStorageData.username,
			token: token,
			refresh_token: refresh_token,
			music_provider: localStorageData.music_provider,
		});

		socket.on('lobbyMessage', (lobbyMessages) => {
			setMessages(lobbyMessages);
		});

		socket.on('setLobbyInfo', ({ members, lobbyMessages }) => {
			setMembers(members);
			setMessages(lobbyMessages);
		});
	}, []);

	return <></>;
}

export default SocketHandler;
