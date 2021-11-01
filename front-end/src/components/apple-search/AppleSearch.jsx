import { SocketContext } from "../../context/socketContext";
import { useForm } from "react-hook-form";
import React, { useEffect, useContext, useState } from "react";
//Handles the calling and displaying of Apple Search
function AppleSearch({ lobbyId, setSong }) {
  const socket = useContext(SocketContext);
  const [searchResults, setSearchResults] = useState([]);
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    //Apple Search Controller
    socket.on("appleSearchResults", (searchResults) => {
      setSearchResults(searchResults);
    });
  }, []);

  function searchSong(data) {
    setValue("song", "");
    socket.emit("appleSearch", data.song, lobbyId);
  }
  return (
    <div>
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
    </div>
  );
}

export default AppleSearch;
