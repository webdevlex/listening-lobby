import "./AppleDisplay.css";
import { AppleMusicContext } from "../../context/AppleMusicContext";
import React, { useEffect, useContext, useState } from "react";
import { SocketContext } from "../../context/socketContext";

function AppleDisplay() {
  const [musicKit, setMusicKit] = useContext(AppleMusicContext);
  const [ran, setRan] = useState(false);
  const [songInfo, setSongInfo] = useState({
    playing: false,
  });

  //Event listener

  if (!ran) {
    console.log("ran");
    musicKit.addEventListener("mediaItemDidChange", () => {
      changeSongInfo();
    });
    setRan(true);
  }

  let changeSongInfo = () => {
    setSongInfo({
      playing: true,
      artist: musicKit.player.nowPlayingItem.artistName,
      song: musicKit.player.nowPlayingItem.attributes.name,
      img: musicKit.player.nowPlayingItem.artworkURL,
    });
  };

  return (
    <div>
      {songInfo.playing === true ? (
        <div className="player">
          <div className="song">{songInfo.song}</div>
          <div className="artist">{songInfo.artist}</div>
          <img src={songInfo.img} alt="" width="300" height="300"></img>
        </div>
      ) : (
        <div>Nothing playing</div>
      )}
    </div>
  );
}

export default AppleDisplay;
