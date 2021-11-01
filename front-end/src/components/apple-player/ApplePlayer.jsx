import React, { useEffect, useContext, useState } from "react";
import { SocketContext } from "../../context/socketContext";
import { AppleMusicContext } from "../../context/AppleMusicContext";
import { useForm } from "react-hook-form";
import "./apple-player.scss";
import AppleDisplay from "../apple-display/AppleDisplay";
import AppleQueue from "../apple-queue/AppleQueue";

function ApplePlayer({ lobby_id }) {
  const socket = useContext(SocketContext);
  const [musicKit, setMusicKit] = useContext(AppleMusicContext);
  const [searchResults, setSearchResults] = useState([]);
  const { register, handleSubmit, setValue } = useForm();
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

    //Apple Search Controller
    socket.on("searchResults", (searchResults) => {
      setSearchResults(searchResults);
    });
  }, []);

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
  function playSong() {
    socket.emit("playSong", lobby_id);
  }

  function searchSong(data) {
    setValue("song", "");
    socket.emit("appleSearch", data.song, lobby_id);
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
      <form className="" onSubmit={handleSubmit(searchSong)}>
        <div className="song-name">
          <input {...register("song")} />
        </div>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {searchResults.length === 0 ? (
        <div>no results</div>
      ) : (
        searchResults.map((song) => (
          <div>
            {song.attributes.artistName} - {song.attributes.name}
            <button
              className="search-results-button"
              onClick={() => setSong(song)}
            >
              Add
            </button>
          </div>
        ))
      )}
      <AppleQueue queue={queue}></AppleQueue>
    </div>
  );
}

export default ApplePlayer;
