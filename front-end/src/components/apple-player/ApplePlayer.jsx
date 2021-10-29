import React, { useEffect, useContext } from 'react';
import { SocketContext } from '../../context/socketContext';
import { AppleMusicContext } from '../../context/AppleMusicContext';

function ApplePlayer({ lobby_id }) {
	const socket = useContext(SocketContext);
	const [musicKit, setMusicKit] = useContext(AppleMusicContext);

	useEffect(() => {
		// Apple Socket Functions
		socket.on('playApple', async () => {
			await setSong();
			await play();
		});

		// Apple Player Controllers
		let play = async () => {
			await musicKit.authorize().then(async () => {
				await musicKit.play();
				musicKit.player.volume = 0.05;
			});
		};

		let setSong = async () => {
			await musicKit.authorize().then(async () => {
				await musicKit.setQueue({
					song: '1438243871',
				});
			});
		};
	}, []);

	// Player front-end functions
	function playSong() {
		socket.emit('playSong', lobby_id);
	}

	return (
		<div className='apple-player'>
			<button onClick={() => playSong()}>play</button>;
		</div>
	);
}

export default ApplePlayer;
