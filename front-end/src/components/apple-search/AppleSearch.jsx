import { SocketContext } from '../../context/socketContext';
import { useForm } from 'react-hook-form';
import React, { useEffect, useContext, useState } from 'react';
import './AppleSearch.scss';
//Handles the calling and displaying of Apple Search
function AppleSearch({ lobbyId, setSong, setAlbum }) {
	const socket = useContext(SocketContext);
	const [searchResults, setSearchResults] = useState({
		songs: {
			data: [],
		},
		albums: {
			data: [],
		},
	});
	const { register, handleSubmit, setValue } = useForm();

	useEffect(() => {
		//Apple Search Controller
		socket.on('appleSearchResults', (appleResults) => {
			setSearchResults(appleResults);
		});
	}, [socket]);

	function searchSong(data) {
		setValue('song', '');
		socket.emit('appleSearch', data.song, lobbyId);
	}

	return (
		<div className='search'>
			<div className='all-results'>
				<div className='song-results'>
					<h1>Song Results</h1>
					{searchResults.songs.data.length === 0 ? (
						<div>no songs found</div>
					) : (
						searchResults.songs.data.map((song) => (
							<div className='songInfo'>
								{song.attributes.artistName} - {song.attributes.name}
								<button
									className='add-button'
									onClick={() => setSong(song)}>
									Add
								</button>
							</div>
						))
					)}
				</div>
				<div className='album-results'>
					<h1>Album Results</h1>
					{searchResults.albums.data.length === 0 ? (
						<div>no albums found</div>
					) : (
						searchResults.albums.data.map((album) => (
							<div className='albumInfo'>
								{album.attributes.artistName} -{' '}
								{album.attributes.name}
								<button
									className='add-button'
									onClick={() => setAlbum(album)}>
									Add
								</button>
							</div>
						))
					)}
				</div>
			</div>

			<form className='' onSubmit={handleSubmit(searchSong)}>
				<div className='song-name'>
					<input {...register('song')} />
				</div>
				<button type='submit' className='search-button'>
					Search
				</button>
			</form>
		</div>
	);
}

export default AppleSearch;
