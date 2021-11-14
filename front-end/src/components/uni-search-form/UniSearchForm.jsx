import React, { useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { SocketContext } from '../../context/socketContext';

function UniSearchForm({ setTracks, setAlbums, user }) {
	const { register, handleSubmit, setValue } = useForm();
	const socket = useContext(SocketContext);
	// const refresh_token = params.get('refresh_token');

	useEffect(() => {
		socket.on('uniSearchResults', ({ tracks, albums }) => {
			setAlbums(albums);
			setTracks(tracks);
		});
	}, [socket, setAlbums, setTracks]);

	const onSubmit = ({ search: searchValue }) => {
		setValue('search', '');
		socket.emit('uniSearch', { searchValue, user });
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

export default UniSearchForm;
