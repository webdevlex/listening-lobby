import React, { useEffect, useContext, useState } from "react";
import { SocketContext } from "../../context/socketContext";
import { AppleMusicContext } from "../../context/AppleMusicContext";
import "./apple-player.scss";
import AppleDisplay from "../apple-display/AppleDisplay";
import AppleQueue from "../apple-queue/AppleQueue";
import AppleSearch from "../apple-search/AppleSearch";
function ApplePlayer({ lobby_id }) {
  const socket = useContext(SocketContext);
  const [musicKit, setMusicKit] = useContext(AppleMusicContext);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    // Apple Socket Functions
    socket.on("playApple", async () => {
      await play();
    });

    // Apple Player Controllers
    let play = async () => {
      await musicKit.authorize().then(async () => {
        await musicKit.play();
        musicKit.player.volume = 0.05;
      });
    };
  }, []);

  function playSong() {
    socket.emit("playSong", lobby_id);
  }
  async function removeItemFromQueue(index) {
    //Changing the display of the queue
    let tempQueue = queue;
    tempQueue.splice(index, 1);
    await setQueue([...tempQueue]);

    //Changing MusicKit Queue
    let currentQueue = musicKit.player.queue.items;
    currentQueue.splice(index, 1);
    await musicKit.authorize().then(async () => {
      await musicKit.setQueue({
        songs: currentQueue,
      });
    });
  }
  async function removeAllItemsFromQueue() {
    //Changing the display of the queue

    await setQueue([]);
    //Changing MusicKit Queue
    await musicKit.authorize().then(async () => {
      await musicKit.setQueue({
        songs: [],
      });
    });
  }

  async function playSongByIndex(index) {
    await musicKit.authorize().then(async () => {
      await musicKit.changeToMediaAtIndex(index);
      musicKit.player.volume = 0.05;
    });
    playSong();
  }
  console.log(musicKit);
  async function setSong(song) {
    await musicKit.authorize().then(async () => {
      let musicQueue = musicKit.player.queue;

      musicQueue.append(song);

      setQueue([
        ...queue,
        {
          attributes: {
            artistName: song.attributes.artistName,
            name: song.attributes.name,
          },
        },
      ]);
    });
  }
  async function setAlbum(album) {
    let currentQueue = musicKit.player.queue.items;
    let arrayQueue = [];
    currentQueue.map(({ id }) => {
      arrayQueue.push(id);
    });

    //Added by album id (issue: clears entire queue before adding)
    await musicKit.authorize().then(async () => {
      await musicKit.setQueue({
        album: album.id,
      });
    });

    //If we have existing songs, we will push those
    let newQueue = musicKit.player.queue.items;
    if (arrayQueue.length > 0) {
      newQueue.map(({ id }) => {
        arrayQueue.push(id);
      });

      await musicKit.authorize().then(async () => {
        await musicKit.setQueue({
          songs: arrayQueue,
        });
      });
    }

    //Displaying everysong
    let displayQueue = [];
    newQueue.map(({ attributes }) => {
      displayQueue.push({
        attributes: {
          artistName: attributes.artistName,
          name: attributes.name,
        },
      });
    });
    setQueue([...queue, ...displayQueue]);
  }

  // TEMP PLAYER CONTROLS --- FOR TESTING
  let nextSong = async () => {
    await musicKit.authorize().then(async () => {
      await musicKit.skipToNextItem();
    });
  };
  let prevSong = async () => {
    await musicKit.authorize().then(async () => {
      await musicKit.skipToPreviousItem();
    });
  };
  let pauseSong = async () => {
    await musicKit.authorize().then(async () => {
      await musicKit.pause();
    });
  };

  // TEMP PLAYER CONTROLS --- FOR TESTING

  return (
    <div className="apple-player">
      <div>
        <button onClick={() => playSong()}>Play</button>
        <button onClick={() => prevSong()}>Prev</button>
        <button onClick={() => pauseSong()}>Pause</button>
        <button onClick={() => nextSong()}>Next</button>
      </div>
      <AppleDisplay />
      <div class="temp-ui">
        <AppleSearch lobbyId={lobby_id} setSong={setSong} setAlbum={setAlbum} />
        <AppleQueue
          queue={queue}
          playSongByIndex={playSongByIndex}
          removeItemFromQueue={removeItemFromQueue}
          removeAllItemsFromQueue={removeAllItemsFromQueue}
        />
      </div>
    </div>
  );
}

export default ApplePlayer;
