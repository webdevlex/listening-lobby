import React, { useEffect, useContext, useState } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { PlayersContext } from '../../context/PlayersContext';
import './apple-player.scss';

function ApplePlayer({ lobby_id, playerStatus, queue }) {
	const [volume, setVolume] = useState(10);
	const [socket] = useContext(SocketContext);
	const { apple } = useContext(PlayersContext);
	const [applePlayer] = apple;
	const [playing, setPlaying] = useState(false);

	let removeEventListener = () => {
		applePlayer.removeEventListener('mediaItemDidChange', () => {});
	};
	let addEventListener = (toAdd) => {
		applePlayer.addEventListener('mediaItemDidChange', () => {
			socket.emit('mediaChange', { lobby_id });
		});
		if (toAdd) {
			applePlayer.player.addEventListener('playbackStateDidChange', () => {
				if (applePlayer.player.playbackState === 10) {
					socket.emit('mediaChange', { lobby_id });
				}
			});
		}
	};

	useEffect(() => {
		//Event listener for media change on startup
		addEventListener(true);

		//Sets defualt volume to half
		applePlayer.player.volume = 0.1;

		// Handles users who join a session and needs to catch up.
		if (playerStatus && queue.length > 0) {
			setMusicKitQueue(queue[0].apple.id);
			applePlayer.seekToTime(playerStatus.timestamp / 1000);
			if (!playerStatus.paused) {
				play();
			}
		}
		//Still testing

		// Apple Player Controllers - user only play pause function
		let playSong = async () => {
			await applePlayer.authorize();
			removeEventListener();
			await applePlayer.play();
			addEventListener(false);
		};

		let pauseSong = async () => {
			await applePlayer.authorize();
			removeEventListener();
			await applePlayer.pause();
			addEventListener(false);
		};

		// needed for people to join if admin is using apple player
		socket.on('getPlayerData', (memberId) => {
			socket.emit('playerData', {
				paused: !applePlayer.player.isPlaying,
				timestamp: applePlayer.player.currentPlaybackTime * 1000,
				lobby_id,
				memberId,
			});
		});

		socket.on('play', async () => {
			setPlaying(true);
			await playSong();
		});

		socket.on('pause', async () => {
			setPlaying(false);
			await pauseSong();
		});

		socket.on('firstSong', async (queue) => {
			await setMusicKitQueue(queue[0].apple);
		});

		// On end or on skip
		socket.on('popped', async (queue) => {
			await setMusicKitQueue(queue[0].apple);
			playSong();
		});

		socket.on('emptyQueue', async (queue) => {
			setPlaying(false);
			pauseSong();
		});
	}, [socket, applePlayer]);

	//Emits play to all users
	let play = () => {
		socket.emit('play', { lobby_id });
	};

	async function setMusicKitQueue(id) {
		await applePlayer.authorize();
		await applePlayer.setQueue({
			song: id,
		});
	}

	// TEMP PLAYER CONTROLS --- FOR TESTING
	let nextSong = async () => {
		await applePlayer.authorize();
		socket.emit('skip', { lobby_id });
		// await applePlayer.skipToNextItem();
	};
	let getInstance = async () => {
		console.log(applePlayer);
	};

	let updateVolume = (e, data) => {
		applePlayer.player.volume = e.target.value / 100;
		setVolume(data);
	};

	// TEMP PLAYER CONTROLS --- FOR TESTING

	return (
		<div className='apple-player'>
			<div>
				<button onClick={() => play()}>
					<p>{playing ? 'PAUSE' : 'PLAY'}</p>
				</button>
				<button onClick={() => nextSong()}>Next</button>
				<button onClick={() => getInstance()}>Get Instance</button>
				<input
					className='volume-slider'
					type='range'
					min='0'
					max='100'
					value={volume}
					onChange={updateVolume}
				/>
			</div>
		</div>
	);
}

export default ApplePlayer;

// await applePlayer.addToLibrary(id);
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
// try {
//   await applePlayer.addToLibrary(queue[0].apple.id, "song");
// } catch (res) {
//   console.log(res);
// }
// socket.on("updateAppleQueue", (playerData) => {
//   setMusicKitQueue(playerData);
// });
