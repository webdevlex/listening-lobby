import React, { useState, useContext, useEffect, useRef } from 'react';
import DesignatedPlayer from '../../components/designated-player/DesignatedPlayer';
import LobbyMembers from '../../components/lobby-members/LobbyMembers';
import LobbyMessages from '../../components/lobby-messages/LobbyMessages';
import LobbySettings from '../../components/lobby-settings/LobbySettings';
import LobbyCenter from '../../components/lobby-center/LobbyCenter';
import SocketHandler from '../../components/socket-handler/SocketHandler';
import AlbumPopup from '../../components/album-popup/AlbumPopup';
import socketio from 'socket.io-client';
import InvitePopup from '../../components/invite-popup/InvitePopup';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';

import './lobby.scss';

function Lobby() {
	// Context
	const [socket, setSocket] = useContext(SocketContext);
	const { apple } = useContext(PlayersContext);
	const [applePlayer] = apple;

	// State managament
	const [playerStatus, setPlayerStatus] = useState(null);
	const [members, setMembers] = useState([]);
	const [messages, setMessages] = useState([]);
	const [queue, setQueue] = useState([]);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [centerDisplay, setCenterDisplay] = useState('player');
	const [likedSongs, setLikedSongs] = useState([]);
	const [albums, setAlbums] = useState([]);
	const [tracks, setTracks] = useState([]);
	const [playing, setPlaying] = useState(false);
	const [displayAlbumQuestion, setDisplayAlbumQuestion] = useState(false);
	const [displayInvitePopup, setDisplayInvitePopup] = useState(false);
	const [albumMissingOn, setAlbumMissingOn] = useState(null);
	const beenAdded = useRef([]);
	const [adminId, setAdminId] = useState(null);

	// Loaders
	const [buttonsClickable, setButtonsClickable] = useState(true);

	useEffect(() => {
		if (!socket) {
			const url = '' || 'http://localhost:8888';
			setSocket(socketio.connect(url));
		}

		// return () => {
		// 	if (socket) {
		// 		window.location.replace('http://localhost:3000');
		// 	}
		// };
	}, [applePlayer, setSocket, socket]);

	return socket ? (
		<div className='lobby'>
			<SocketHandler
				user={user}
				setUser={setUser}
				setMembers={setMembers}
				setMessages={setMessages}
				setQueue={setQueue}
				setPlayerStatus={setPlayerStatus}
				setButtonsClickable={setButtonsClickable}
				setAlbums={setAlbums}
				setTracks={setTracks}
				setDisplayAlbumQuestion={setDisplayAlbumQuestion}
				setAlbumMissingOn={setAlbumMissingOn}
				beenAdded={beenAdded}
				setAdminId={setAdminId}
			/>

			{!playerStatus ? (
				<h1>LOADING 1</h1>
			) : (
				<>
					<div className={`player-grid ${loading ? 'hide' : null}`}>
						<DesignatedPlayer
							user={user}
							playerStatus={playerStatus}
							queue={queue}
							setLoading={setLoading}
							buttonsClickable={buttonsClickable}
							loading={loading}
							setPlaying={setPlaying}
							playing={playing}
							likedSongs={likedSongs}
							setLikedSongs={setLikedSongs}
						/>
					</div>
					{loading ? (
						<h1>LOADING 2</h1>
					) : (
						<>
							<AlbumPopup
								displayAlbumQuestion={displayAlbumQuestion}
								setDisplayAlbumQuestion={setDisplayAlbumQuestion}
								albumMissingOn={albumMissingOn}
								user={user}
							/>
							<InvitePopup
								displayInvitePopup={displayInvitePopup}
								setDisplayInvitePopup={setDisplayInvitePopup}
								user={user}
							/>
							<div className='settings-grid'>
								<LobbySettings
									setCenterDisplay={setCenterDisplay}
									setDisplayInvitePopup={setDisplayInvitePopup}
								/>
							</div>
							<div className='members-grid'>
								<LobbyMembers members={members} adminId={adminId} />
							</div>
							<div className='messages-grid'>
								<LobbyMessages messages={messages} user={user} />
							</div>
							<div className='center-grid'>
								<LobbyCenter
									centerDisplay={centerDisplay}
									queue={queue}
									user={user}
									buttonsClickable={buttonsClickable}
									likedSongs={likedSongs}
									setLikedSongs={setLikedSongs}
									albums={albums}
									setAlbums={setAlbums}
									tracks={tracks}
									setTracks={setTracks}
									playing={playing}
									lobbyId={user.lobby_id}
									beenAdded={beenAdded}
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
