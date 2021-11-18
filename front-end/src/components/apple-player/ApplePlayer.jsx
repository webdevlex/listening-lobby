import React, { useEffect, useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { AppleMusicContext } from '../../context/AppleMusicContext';
import './apple-player.scss';

function ApplePlayer({ lobby_id }) {
	const [socket] = useContext(SocketContext);
	const [musicKit] = useContext(AppleMusicContext);
	useEffect(() => {
		console.log(musicKit);
		// Apple Socket Functions
		socket.on('playApple', async () => {
			await play();
		});

		// Apple Player Controllers
		let play = async () => {
			await musicKit.authorize();
			await musicKit.play();
			musicKit.player.volume = 0.05;
		};

		socket.on('updateAppleQueue', (playerData) => {
			// {href, id, type}
			setMusicKitQueue(playerData);
		});
	}, [socket, musicKit]);

	function playSong() {
		socket.emit('playSong', lobby_id);
	}

	//All I need passed in an object that has an {href, id, type}
	async function setMusicKitQueue(item) {
		await musicKit.authorize();

		let musicQueue = musicKit.player.queue;
		if (item.type === 'songs') {
			musicQueue.append(item);
		} else if (item.type === 'albums') {
			let album = await musicKit.api.album(item.id);
			let tracks = album.relationships.tracks.data;
			tracks.forEach((song) => {
				musicQueue.append(song);
			});
		}
	}

	// TEMP PLAYER CONTROLS --- FOR TESTING
	let nextSong = async () => {
		await musicKit.authorize();
		await musicKit.skipToNextItem();
	};
	let prevSong = async () => {
		await musicKit.authorize();
		await musicKit.skipToPreviousItem();
	};
	let pauseSong = async () => {
		await musicKit.authorize();
		await musicKit.pause();
	};

	// TEMP PLAYER CONTROLS --- FOR TESTING

	return (
		<div className='apple-player'>
			<div>
				<button onClick={() => playSong()}>Play</button>
				<button onClick={() => prevSong()}>Prev</button>
				<button onClick={() => pauseSong()}>Pause</button>
				<button onClick={() => nextSong()}>Next</button>
			</div>
		</div>
	);
}

export default ApplePlayer;

// Refrence functions:
//  async function removeItemFromQueue(index) {
//   //Changing the display of the queue
//   let tempQueue = queue;
//   tempQueue.splice(index, 1);
//   await setQueue([...tempQueue]);

//   //Changing MusicKit Queue
//   let currentQueue = musicKit.player.queue.items;

//   //Resets Index of Music player
//   if (index < musicKit.player.queue.position) {
//     musicKit.player.queue.position = musicKit.player.queue.position - 1;
//   }

//   currentQueue.splice(index, 1);

//   await musicKit.authorize();
//   await musicKit.setQueue({
//     songs: currentQueue,
//   });
// }
// async function playSongByIndex(index) {
//   await musicKit.authorize();
//   await musicKit.changeToMediaAtIndex(index);
//   musicKit.player.volume = 0.05;

//   playSong();
// }

// async function removeAllItemsFromQueue() {
//   //Changing the display of the queue

//   await setQueue([]);
//   //Changing MusicKit Queue
//   await musicKit.authorize();
//   await musicKit.setQueue({
//     songs: [],
//   });
//   await musicKit.pause();
// }
