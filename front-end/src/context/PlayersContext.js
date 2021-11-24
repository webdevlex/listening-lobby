import React, { useState, createContext } from 'react';

export const PlayersContext = createContext();

export const PlayersProvider = (props) => {
	const [applePlayer, setApplePlayer] = useState();
	const [spotifyPlayer, setSpotifyPlayer] = useState();

	return (
		<PlayersContext.Provider
			value={{
				apple: [applePlayer, setApplePlayer],
				spotify: [spotifyPlayer, setSpotifyPlayer],
			}}>
			{props.children}
		</PlayersContext.Provider>
	);
};
