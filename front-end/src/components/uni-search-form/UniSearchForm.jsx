import React, { useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { SocketContext } from '../../context/SocketContext';

function UniSearchForm({ setTracks, setAlbums, user }) {
	const { register, handleSubmit, setValue } = useForm();
	const [socket] = useContext(SocketContext);
	// const refresh_token = params.get('refresh_token');

	useEffect(() => {
		return () => {
			setTracks([]);
			setAlbums([]);
		};
	}, [socket, setAlbums, setTracks]);

	const onSubmit = ({ search: searchValue }) => {
		if (searchValue) {
			setValue('search', '');
			socket.emit('uniSearch', { searchValue, user });
		}
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
