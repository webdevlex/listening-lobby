import React, { useState, createContext } from 'react';

export const PlayersContext = createContext();

export const PlayersProvider = (props) => {
	const [applePlayer, setApplePlayer] = useState();
	const [spotifyPlayer, setSpotifyPlayer] = useState();
	const [ran, setRan] = useState(false);

	return (
		<PlayersContext.Provider
			value={{
				apple: [applePlayer, setApplePlayer],
				spotify: [spotifyPlayer, setSpotifyPlayer],
				spotifyRan: [ran, setRan],
			}}>
			{props.children}
		</PlayersContext.Provider>
	);
};
