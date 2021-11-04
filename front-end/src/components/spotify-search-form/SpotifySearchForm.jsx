import React, { useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { SocketContext } from '../../context/socketContext';

export default function SpotifySearchForm({ setTracks, setAlbums }) {
	const { register, handleSubmit, setValue } = useForm();
	const socket = useContext(SocketContext);
	const params = new URLSearchParams(window.location.search);
	const token = params.get('token');
	// const refresh_token = params.get('refresh_token');

	useEffect(() => {
		socket.on('spotifySearchResults', (searchResults) => {
			console.log(searchResults);
			const albums = searchResults.albums.items;
			const tracks = searchResults.tracks.items;

			const necessaryTrackInfo = tracks.map((track) => {
				return {
					trackName: track.name,
					artits: track.artists.map(({ name }) => name).join(', '),
					trackCover: track.album.images[0].url,
					id: track.id,
				};
			});

			const necessaryAlbumInfo = albums.map((album) => {
				return {
					albumName: album.name,
					artits: album.artists.map(({ name }) => name).join(', '),
					albumCover: album.images[0].url,
					id: album.id,
				};
			});

			setAlbums(necessaryAlbumInfo);
			setTracks(necessaryTrackInfo);
		});
	}, [socket, setAlbums, setTracks]);

	const onSubmit = ({ search }) => {
		setValue('search', '');
		socket.emit('spotifySearch', search, token);
	};

	return (
		<form className='search-form' onSubmit={handleSubmit(onSubmit)}>
			<div className='search-input'>
				<label htmlFor='search'>Search: </label>
				<input {...register('search')} />
			</div>
			<button type='submit' className='search-button'>
				Search
			</button>
		</form>
	);
}
