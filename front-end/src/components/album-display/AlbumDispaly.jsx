import React, { useContext } from "react";
import { SocketContext } from "../../context/SocketContext";
import "./album-display.scss";

export default function AlbumDispaly({ albums, user }) {
  const [socket] = useContext(SocketContext);

  function handleSongClick(album) {
    socket.emit("addAlbumToQueue", { album, user });
  }
  //TEMPORARY BUG FIX
  let hasAlbum = albums === undefined ? false : albums[0];

  return (
    <div className='albums'>
      <h1>Albums</h1>
      {hasAlbum
        ? albums.map((album) => (
            <div
              key={album.id}
              className='results-display'
              onClick={() => handleSongClick(album)}
            >
              <div className='album-cover-container'>
                <img src={album.albumCover} alt='' />
              </div>
              <div className='text'>
                <p className='primary'>{album.albumName}</p>
                <p>{album.artists}</p>
              </div>
              <div className='add-button'>+</div>
            </div>
          ))
        : null}
    </div>
  );
}
