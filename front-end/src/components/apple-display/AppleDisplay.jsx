import "./AppleDisplay.css";
import { AppleMusicContext } from "../../context/AppleMusicContext";
import React, { useContext, useState, useEffect } from "react";

//Displays playing song info
function AppleDisplay() {
  const [musicKit] = useContext(AppleMusicContext);
  //const [ran, setRan] = useState(false);
  const [songInfo, setSongInfo] = useState({
    playing: false,
  });

  //Event listener
  useEffect(() => {
    musicKit.addEventListener("mediaItemDidChange", () => {
      changeSongInfo();
    });

    musicKit.addEventListener("mediaPlaybackError", () => {});
  }, []);

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
        <div className='player'>
          <div className='song'>{songInfo.song}</div>
          <div className='artist'>{songInfo.artist}</div>
          <img src={songInfo.img} alt='' width='300' height='300'></img>
        </div>
      ) : (
        <div>Nothing playing</div>
      )}
    </div>
  );
}

export default AppleDisplay;
