import React, { useContext } from "react";
import "./lobby-queue.scss";
import { PlayersContext } from "../../context/PlayersContext";

export default function LobbyQueue({ queue, music_provider }) {
  const { apple } = useContext(PlayersContext);
  const [applePlayer] = apple;
  const queueHasItems = queue[0];
  async function addSongToLibrary(spotifySong, appleSong) {
    if (music_provider === "apple") {
      await applePlayer.addToLibrary(appleSong);
    } else {
      //TODO Spotify add
    }
  }
  return (
    <div className='lobby-queue'>
      <h1>Queue</h1>
      {queueHasItems &&
        queue.map(({ ui, apple, spotify }, index) => (
          <div className='queue-item'>
            <p className='index'>{index + 1}</p>
            <div className='primary-info'>
              <div className='album-cover-container'>
                <img src={ui.trackCover} alt='' />
              </div>
              <div className='text'>
                <p className='primary-text'>{ui.trackName}</p>
                <p>{ui.artists}</p>
              </div>
            </div>
            <p className='remove-button'>remove</p>
            <p
              className='add-to-library-button'
              onClick={() => {
                addSongToLibrary(spotify, apple);
              }}
            >
              add to library
            </p>
          </div>
        ))}
    </div>
  );
}
