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
      <AppleDisplay></AppleDisplay>
      <AppleSearch lobbyId={lobby_id} setSong={setSong}></AppleSearch>
      <AppleQueue queue={queue}></AppleQueue>
    </div>
  );
}

export default ApplePlayer;
