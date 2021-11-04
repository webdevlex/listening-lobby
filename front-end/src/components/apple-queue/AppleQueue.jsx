import "./AppleQueue.scss";
import React, { useContext, useState } from "react";
import { AppleMusicContext } from "../../context/AppleMusicContext";
function AppleQueue({
  queue,
  playSongByIndex,
  removeItemFromQueue,
  removeAllItemsFromQueue,
}) {
  const [musicKit] = useContext(AppleMusicContext);
  return (
    <div>
      <div className='queue-menu'>
        <h1>QUEUE</h1>
        <button
          className='delete-btn'
          onClick={() => removeAllItemsFromQueue()}
        >
          Delete all
        </button>
      </div>
      {queue.length === 0 ? (
        <div>No Queue</div>
      ) : (
        queue.map((song, index) => (
          <div className='queue-item'>
            <div
              className='queue-name'
              onClick={() => {
                playSongByIndex(index);
              }}
            >
              {song.attributes.artistName} - {song.attributes.name}
            </div>
            <button
              className='delete-btn'
              onClick={() => {
                index != musicKit.player.queue.position
                  ? removeItemFromQueue(index)
                  : alert("cant delete playing song");
              }}
            >
              delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AppleQueue;
