import React, { useState, createContext } from 'react';

export const AppleMusicContext = createContext();

export const AppleMusicProvider = (props) => {
	const [musicKit, setMusicKit] = useState();

	return (
		<AppleMusicContext.Provider value={[musicKit, setMusicKit]}>
			{props.children}
		</AppleMusicContext.Provider>
	);
};
