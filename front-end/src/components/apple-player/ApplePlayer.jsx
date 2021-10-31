import React, { useEffect, useContext, useState } from "react";
import { SocketContext } from "../../context/socketContext";
import { AppleMusicContext } from "../../context/AppleMusicContext";
import { useForm } from "react-hook-form";
import "./apple-player.scss";

function ApplePlayer({ lobby_id }) {
  const socket = useContext(SocketContext);
  const [musicKit, setMusicKit] = useContext(AppleMusicContext);
  const [searchResults, setSearchResults] = useState([]);
  const { register, handleSubmit, setValue } = useForm();

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
    socket.on("searchResults", (searchResults) => {
      setSearchResults(searchResults);
    });
  }, []);

  let setSong = async (songId) => {
    await musicKit.authorize().then(async () => {
      await musicKit.setQueue({
        song: songId,
      });
      alert("Song added to Queue");
    });
  };
  function playSong() {
    socket.emit("playSong", lobby_id);
  }

  function searchSong(data) {
    setValue("song", "");
    socket.emit("appleSearch", data.song, lobby_id);
  }

  return (
    <div className="apple-player">
      <div>
        <button onClick={() => playSong()}>play</button>
      </div>
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
              onClick={async () => await setSong(song.id)}
            >
              Add
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ApplePlayer;
