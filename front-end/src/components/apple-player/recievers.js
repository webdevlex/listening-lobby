import * as handlers from "./handlers.js";
export function setupSocketRecievers(
  applePlayer,
  socket,
  lobby_id,
  setPlaying,
  playerStatus,
  queue
) {
  handlers.startUp(
    applePlayer,
    socket,
    lobby_id,
    playerStatus,
    queue,
    setPlaying
  );
  socket.on("getPlayerData", (memberId) => {
    handlers.handleGetPlayerData(applePlayer, memberId, lobby_id, socket);
  });
  socket.on("play", () => {
    handlers.handlePlay(applePlayer, socket, lobby_id, setPlaying);
  });
  socket.on("pause", () => {
    handlers.handlePause(applePlayer, socket, lobby_id, setPlaying);
  });
  socket.on("firstSong", (queue) => {
    handlers.handleFirstSong(applePlayer, queue);
  });
  socket.on("popped", (queue) => {
    handlers.handlePopped(applePlayer, socket, queue, lobby_id, setPlaying);
  });
  socket.on("emptyQueue", () => {
    handlers.handleEmptyQueue(applePlayer, socket, lobby_id, setPlaying);
  });
  socket.on("removeFirst", (newQueue, isPlaying) => {
    handlers.handleRemoveFirst(
      applePlayer,
      socket,
      lobby_id,
      setPlaying,
      newQueue,
      isPlaying
    );
  });
}
