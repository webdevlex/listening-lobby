import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../context/socketContext';
import { useForm } from 'react-hook-form';
import './spotify-search.scss';

export default function SpotfiySearch() {
	const params = new URLSearchParams(window.location.search);
	const token = params.get('token');
	// const refresh_token = params.get('refresh_token');
	const socket = useContext(SocketContext);
	const { register, handleSubmit, setValue } = useForm();

	// Temp State
	const [albums, setAlbums] = useState([]);
	const [tracks, setTracks] = useState([]);

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
	}, [socket, albums, setAlbums, tracks, setTracks]);

	const onSubmit = ({ search }) => {
		setValue('search', '');
		socket.emit('spotifySearch', search, token);
	};

	return (
		<div>
			<form className='' onSubmit={handleSubmit(onSubmit)}>
				<div className='message-input'>
					<label htmlFor='message'>Search: </label>
					<input {...register('search')} />
				</div>
				<button type='submit' className='search-button'>
					Search
				</button>
			</form>
			<div>
				<h1>Tracks</h1>
				{tracks.map(({ trackName, artits, trackCover, id }) => (
					<div key={id} className='results-display'>
						<div className='album-cover-container'>
							<img src={trackCover} alt='' />
						</div>
						<div className='text'>
							<p>Track Name: {trackName}</p>
							<p>artits: {artits}</p>
						</div>
					</div>
				))}
			</div>
			<div>
				<h1>Albums</h1>
				{albums.map(({ albumName, artits, albumCover, id }) => (
					<div key={id} className='results-display'>
						<div className='album-cover-container'>
							<img src={albumCover} alt='' />
						</div>
						<div className='text'>
							<p>Album Name: {albumName}</p>
							<p>artits: {artits}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
