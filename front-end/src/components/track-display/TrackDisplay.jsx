import React, { useContext } from "react";
import { SocketContext } from "../../context/SocketContext";
import "./track-display.scss";

export default function TrackDisplay({ tracks, user }) {
  const [socket] = useContext(SocketContext);

  function handleSongClick(songData) {
    socket.emit("addSongToQueue", { songData, user });
  }

  const hasTracks = tracks[0];

  return (
    <div className='tracks'>
      <h1>Tracks</h1>
      {hasTracks
        ? tracks.map((track) => (
            <div
              key={track.id}
              className='results-display'
              onClick={() => handleSongClick(track)}
            >
              <div className='album-cover-container'>
                <img src={track.trackCover} alt='' />
              </div>
              <div className='text'>
                <p className='primary'>{track.trackName}</p>
                <p>{track.artists}</p>
              </div>
              <div className='add-button'>+</div>
            </div>
          ))
        : null}
    </div>
  );
}
