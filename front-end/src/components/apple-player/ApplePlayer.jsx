import React, { useEffect, useContext, useState } from "react";
import { SocketContext } from "../../context/SocketContext";
import { PlayersContext } from "../../context/PlayersContext";
import "./apple-player.scss";
import { setupSocketRecievers } from "../apple-player/recievers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faStepBackward,
  faStepForward,
  faVolumeUp,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../loading-spinner/LoadingSpinner";
import { faHeart as heartOutline } from "@fortawesome/free-regular-svg-icons";

function ApplePlayer({
  user,
  playerStatus,
  queue,
  buttonsClickable,
  loading,
  likedSongs,
  setLikedSongs,
  playing,
  setPlaying,
}) {
  const [volume, setVolume] = useState(10);
  const [socket] = useContext(SocketContext);
  const { apple } = useContext(PlayersContext);
  const [applePlayer] = apple;
  const [percent, setPercent] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [ran, setRan] = useState(false);
  const song = queue[0] ? queue[0] : null;

  useEffect(() => {
    if (!ran) {
      setupSocketRecievers(
        applePlayer,
        socket,
        user,
        setPlaying,
        playerStatus,
        queue,
        setPercent,
        setCurrentTime
      );
      setRan(true);
    }
  }, [applePlayer, user, playerStatus, queue, ran, setRan, socket, setPlaying]);

  let play = () => {
    socket.emit("play", { user });
  };

  let skip = async () => {
    socket.emit("skip", { user });
  };

  let getInstance = async () => {
    console.log(applePlayer);
  };

  let updateVolume = (e, data) => {
    applePlayer.volume = e.target.value / 100;
    setVolume(data);

    // Animation
    let target = e.target;
    if (e.target.type !== "range") {
      target = document.getElementById("range");
    }
    const min = target.min;
    const max = target.max;
    const val = target.value;

    target.style.backgroundSize = ((val - min) * 100) / (max - min) + "% 100%";
  };

  async function addSongToLibrary(spotifySong, appleSong, id) {
    setLikedSongs([...likedSongs, id]);
    if (user.music_provider === "apple") {
      await applePlayer.addToLibrary(appleSong);
    } else {
      socket.emit("likeSong", { spotifySong, user });
    }
  }

  function formatDuration(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  return loading ? null : (
    <div className='player-bar'>
      <div className='player-left'>
        {song ? (
          <>
            <div className='album-cover-container'>
              <img className='album-cover' src={song.ui.trackCover} alt='' />
            </div>
            <div className='text'>
              <p className='simple-text track-title'>{song.ui.trackName}</p>
              <p className='simple-text track-artists'>{song.ui.artists}</p>
            </div>
            <div className='like-icon-container'>
              {likedSongs.includes(queue[0].ui.id) ? (
                <FontAwesomeIcon className='like-icon' icon={faHeart} />
              ) : (
                <FontAwesomeIcon
                  className='like-icon'
                  icon={heartOutline}
                  onClick={() => {
                    addSongToLibrary(
                      queue[0].spotify,
                      queue[0].apple,
                      queue[0].ui.id
                    );
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <div className='album-cover-container'>
              <p className='default-album-cover'>?</p>
            </div>
            <div className='text'>
              <p className='simple-text track-title'>No Songs Added</p>
              <p className='simple-text track-artists'>
                Search and add songs to queue!
              </p>
            </div>
          </>
        )}
      </div>
      <div className='player-center'>
        <div className='player-controls-container'>
          {buttonsClickable ? (
            <div className='player-controls'>
              <FontAwesomeIcon className='skip-icon' icon={faStepBackward} />
              <button className='play-button' onClick={() => play()}>
                {playing ? (
                  <FontAwesomeIcon className='action-icon' icon={faPause} />
                ) : (
                  <FontAwesomeIcon className='action-icon' icon={faPlay} />
                )}
              </button>
              <FontAwesomeIcon
                className='skip-icon'
                onClick={() => skip()}
                icon={faStepForward}
              />
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </div>
        <div className='time-bar-container'>
          <p className='current-time time'>{formatDuration(currentTime)}</p>
          <div className='time-bar'>
            <div
              className='time-bar-slider'
              style={{ left: `${percent}%` }}
            ></div>
          </div>
          <p className='total-time time'>
            {song ? song.ui.formattedDuration : "0:00"}
          </p>
        </div>
      </div>
      <button onClick={() => getInstance()}></button>
      <div className='player-right'>
        {/* <button onClick={() => getInstance()}>Get Instance</button> */}
        <FontAwesomeIcon className='action-icon' icon={faVolumeUp} />
        <input
          className='volume-slider'
          type='range'
          min='0'
          max='100'
          defaultValue={volume}
          onChange={updateVolume}
        />
      </div>
    </div>
  );
}

export default ApplePlayer;
