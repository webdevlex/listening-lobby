import React, { useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const url = '' || 'http://localhost:8888';
const socket = io.connect(url);

function App() {
	return (
		<div className='App'>
			<h1>Welcome!</h1>
			<button
				onClick={() =>
					window.location.replace(
						'http://localhost:8888/spotify/login'
					)
				}>
				Spotify
			</button>
		</div>
	);
}

export default App;
