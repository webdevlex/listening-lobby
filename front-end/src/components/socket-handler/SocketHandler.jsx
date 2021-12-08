import { useContext, useEffect } from 'react';
import { SocketContext } from '../../context/SocketContext';

function SocketHandler({
	setUser,
	setMembers,
	setMessages,
	setQueue,
	setPlayerStatus,
	setButtonsClickable,
}) {
	const params = new URLSearchParams(window.location.search);
	const token = params.get('token');
	const refresh_token = params.get('refresh_token');
	const [socket] = useContext(SocketContext);

	// Loaders

	useEffect(() => {
		const localStorageData = JSON.parse(localStorage.getItem('user'));
		setUser({ ...localStorageData, token, refresh_token });

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

		socket.on('setLobbyInfo', (members, lobbyMessages) => {
			setMembers(members);
			setMessages(lobbyMessages);
		});

		socket.on('addSong', (queue) => {
			setQueue(queue);
		});

		socket.on('doneLoading', (playerData) => {
			setPlayerStatus(playerData);
		});

		socket.on('deactivateButtons', () => {
			setButtonsClickable(false);
		});

		socket.on('activateButtons', () => {
			setButtonsClickable(true);
		});
	}, [
		socket,
		token,
		refresh_token,
		setMembers,
		setMessages,
		setUser,
		setQueue,
		setPlayerStatus,
		setButtonsClickable,
	]);

	return null;
}

export default SocketHandler;
