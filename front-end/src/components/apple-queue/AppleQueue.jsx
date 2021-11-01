function AppleQueue({ queue }) {
  return (
    <div>
      <h1>QUEUE</h1>
      {queue.length === 0 ? (
        <div>No Queue</div>
      ) : (
        queue.map((song) => (
          <div>
            {song.attributes.artistName} - {song.attributes.name}
          </div>
        ))
      )}
    </div>
  );
}

export default AppleQueue;
