import React, { useEffect, useContext } from "react";
import { SocketContext } from "../../context/SocketContext";
import { PlayersContext } from "../../context/PlayersContext";
import "./apple-player.scss";

function ApplePlayer({ lobby_id, playerStatus }) {
  const [socket] = useContext(SocketContext);
  const { apple } = useContext(PlayersContext);
  const [applePlayer] = apple;

  useEffect(() => {
    console.log(applePlayer);
    //Event listener for media change
    applePlayer.addEventListener("mediaItemDidChange", () => {
      socket.emit("mediaChange");
    });

    // Apple Socket Functions
    socket.on("togglePlay", async () => {
      await play();
    });

    // Apple Player Controllers
    let play = async () => {
      await applePlayer.authorize();
      await applePlayer.play();
    };

    // --------- UPDATE ---------: needed for people to join if admin is using apple player
    socket.on("getPlayerData", (memberId) => {
      // socket.emit('playerData', {
      // 	paused: TODO: get current player status (boolean)
      // 	timestamp: get current player timestamp (milliseconds)
      // 	lobby_id, // Completed
      // 	memberId, // Completed
      // });
    });
    socket.on("updateLobbyQueue", (queue) => {
      setMusicKitQueue(queue[0].apple.id);
    });
    socket.on("updateAppleQueue", (playerData) => {
      setMusicKitQueue(playerData);
    });
  }, [socket, applePlayer]);

  let play = async () => {
    socket.emit("togglePlay", { lobby_id });
  };

  async function setMusicKitQueue(id) {
    await applePlayer.authorize();
    await applePlayer.setQueue({
      song: id,
    });
  }

  // TEMP PLAYER CONTROLS --- FOR TESTING
  let nextSong = async () => {
    await applePlayer.authorize();
    await applePlayer.skipToNextItem();
  };
  let prevSong = async () => {
    await applePlayer.authorize();
    await applePlayer.skipToPreviousItem();
  };
  let pauseSong = async () => {
    await applePlayer.authorize();
    await applePlayer.pause();
  };

  // TEMP PLAYER CONTROLS --- FOR TESTING

  return (
    <div className='apple-player'>
      <div>
        <button onClick={() => play()}>Play</button>
        <button onClick={() => prevSong()}>Prev</button>
        <button onClick={() => pauseSong()}>Pause</button>
        <button onClick={() => nextSong()}>Next</button>
      </div>
    </div>
  );
}

export default ApplePlayer;

// Refrence functions:
//  async function removeItemFromQueue(index) {
//   //Changing the display of the queue
//   let tempQueue = queue;
//   tempQueue.splice(index, 1);
//   await setQueue([...tempQueue]);

//   //Changing MusicKit Queue
//   let currentQueue = musicKit.player.queue.items;

//   //Resets Index of Music player
//   if (index < musicKit.player.queue.position) {
//     musicKit.player.queue.position = musicKit.player.queue.position - 1;
//   }

//   currentQueue.splice(index, 1);

//   await musicKit.authorize();
//   await musicKit.setQueue({
//     songs: currentQueue,
//   });
// }
// async function playSongByIndex(index) {
//   await musicKit.authorize();
//   await musicKit.changeToMediaAtIndex(index);
//   musicKit.player.volume = 0.05;

//   playSong();
// }

// async function removeAllItemsFromQueue() {
//   //Changing the display of the queue

//   await setQueue([]);
//   //Changing MusicKit Queue
//   await musicKit.authorize();
//   await musicKit.setQueue({
//     songs: [],
//   });
//   await musicKit.pause();
// }
