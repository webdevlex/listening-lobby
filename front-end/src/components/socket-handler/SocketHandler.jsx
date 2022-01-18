import { useContext, useEffect } from "react";
import { SocketContext } from "../../context/SocketContext";

function SocketHandler({
<<<<<<< HEAD
	user,
	setUser,
	setMembers,
	setMessages,
	setQueue,
	setPlayerStatus,
	setButtonsClickable,
	setAlbums,
	setTracks,
	setDisplayAlbumQuestion,
	setAlbumMissingOn,
	beenAdded,
	setAdminId,
	setSearchLoading,
	setFullAlbum,
	setDisplayFullAlbum,
}) {
	const params = new URLSearchParams(window.location.search);
	const token = params.get('token');
	const refresh_token = params.get('refresh_token');
	const [socket] = useContext(SocketContext);

	useEffect(() => {
		const localStorageData = JSON.parse(localStorage.getItem('user'));

		if (!user) {
			if (localStorageData.authorized) {
				localStorageData.authorized = false;
				localStorage.setItem('user', JSON.stringify(localStorageData));
			} else {
				socket.disconnect();
				window.location.replace('http://localhost:3000');
			}
			setUser({ ...localStorageData, token, refresh_token });
		} else {
			socket.emit('attemptJoinLobby', {
				lobby_id: localStorageData.lobby_id,
				username: localStorageData.username,
				token: token,
				refresh_token: refresh_token,
				music_provider: localStorageData.music_provider,
				frontEndId: localStorageData.frontEndId,
			});

			socket.on('lobbyMessage', (lobbyMessages) => {
				setMessages(lobbyMessages);
			});

			socket.on('lobbyMaxReached', () => {
				localStorage.setItem('capacity', JSON.stringify({ maxReached: true }));
				window.location.replace('http://localhost:3000');
			});

			socket.on('setLobbyInfo', (members, lobbyMessages) => {
				setMembers(members);
				setMessages(lobbyMessages);
			});

			socket.on('setMembers', (members) => {
				setMembers(members);
			});

			socket.on('addSong', (queue) => {
				var element = window;
				var event = new Event('resize');
				element.dispatchEvent(event);
				setQueue(queue);
			});

			socket.on('setAdminsPlayerStatus', (playerData) => {
				setPlayerStatus(playerData);
			});

			socket.on('deactivateButtons', () => {
				setButtonsClickable(false);
			});

			socket.on('activateButtons', () => {
				setButtonsClickable(true);
			});

			socket.on('getUserReady', () => {
				socket.emit('userReady', { user });
			});

			socket.on('questionAlbumAdd', (missingOn) => {
				setAlbumMissingOn(missingOn);
				setDisplayAlbumQuestion(true);
			});

			socket.on('uniSearchResults', ({ tracks, albums }) => {
				setSearchLoading(false);
				setAlbums(albums);
				setTracks(tracks);
			});

			socket.on('addCheck', (albumId) => {
				beenAdded.current = [...beenAdded.current, albumId];
			});

			socket.on('setAdmin', (adminId) => {
				setAdminId(adminId);
			});

			socket.on('kickUser', () => {
				localStorage.setItem('loadingTooLong', true);
				window.location.replace('http://localhost:3000');
			});

			socket.on('displayAlbum', (tracks) => {
				setFullAlbum(tracks);
				setDisplayFullAlbum(true);
			});
		}
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
		user,
		setAlbums,
		setTracks,
		setDisplayAlbumQuestion,
		setAlbumMissingOn,
		beenAdded,
		setAdminId,
		setSearchLoading,
		setFullAlbum,
		setDisplayFullAlbum,
	]);

	return null;
=======
  user,
  setUser,
  setMembers,
  setMessages,
  setQueue,
  setPlayerStatus,
  setButtonsClickable,
  setAlbums,
  setTracks,
  setDisplayAlbumQuestion,
  setAlbumMissingOn,
  beenAdded,
  setAdminId,
  setSearchLoading,
  setShuffle,
}) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const refresh_token = params.get("refresh_token");
  const [socket] = useContext(SocketContext);

  useEffect(() => {
    const localStorageData = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      if (localStorageData.authorized) {
        localStorageData.authorized = false;
        localStorage.setItem("user", JSON.stringify(localStorageData));
      } else {
        socket.disconnect();
        window.location.replace("http://localhost:3000");
      }
      setUser({ ...localStorageData, token, refresh_token });
    } else {
      socket.emit("joinLobby", {
        lobby_id: localStorageData.lobby_id,
        username: localStorageData.username,
        token: token,
        refresh_token: refresh_token,
        music_provider: localStorageData.music_provider,
        frontEndId: localStorageData.frontEndId,
      });

      socket.on("lobbyMessage", (lobbyMessages) => {
        setMessages(lobbyMessages);
      });

      socket.on("lobbyMaxReached", () => {
        localStorage.setItem("capacity", JSON.stringify({ maxReached: true }));
        window.location.replace("http://localhost:3000");
      });

      socket.on("setLobbyInfo", (members, lobbyMessages) => {
        console.log(members);
        setMembers(members);
        setMessages(lobbyMessages);
      });

      socket.on("addSong", (queue) => {
        var element = window;
        var event = new Event("resize");
        element.dispatchEvent(event);
        setQueue(queue);
      });

      socket.on("doneLoading", (playerData) => {
        setPlayerStatus(playerData);
      });

      socket.on("deactivateButtons", () => {
        setButtonsClickable(false);
      });

      socket.on("activateButtons", () => {
        setButtonsClickable(true);
      });

      socket.on("getUserReady", () => {
        socket.emit("userReady", { user });
      });

      socket.on("questionAlbumAdd", (missingOn) => {
        setAlbumMissingOn(missingOn);
        setDisplayAlbumQuestion(true);
      });

      socket.on("uniSearchResults", ({ tracks, albums }) => {
        setSearchLoading(false);
        setAlbums(albums);
        setTracks(tracks);
      });

      socket.on("addCheck", (albumId) => {
        beenAdded.current = [...beenAdded.current, albumId];
      });

      socket.on("setAdmin", (adminId) => {
        setAdminId(adminId);
      });

      socket.on("kickUser", () => {
        localStorage.setItem("loadingTooLong", true);
        window.location.replace("http://localhost:3000");
      });

      socket.on("shuffleToggled", (shuffleMode) => {
        setShuffle(shuffleMode);
      });
    }
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
    user,
    setAlbums,
    setTracks,
    setDisplayAlbumQuestion,
    setAlbumMissingOn,
    beenAdded,
    setAdminId,
    setSearchLoading,
  ]);

  return null;
>>>>>>> 8205431b8c5ea9d53d38a0b05f11f1a916831811
}

export default SocketHandler;
