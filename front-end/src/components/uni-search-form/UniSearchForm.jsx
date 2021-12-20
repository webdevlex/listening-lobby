import React, { useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { SocketContext } from '../../context/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import './search-form.scss';

function UniSearchForm({ setTracks, setAlbums, user }) {
	const { register, handleSubmit, setValue, getValues } = useForm({
		defaultValues: {
			search: 'Search',
		},
	});
	const [socket] = useContext(SocketContext);
	// const refresh_token = params.get('refresh_token');

	useEffect(() => {
		return () => {
			setTracks([]);
			setAlbums([]);
		};
	}, [socket, setAlbums, setTracks]);

	const onSubmit = ({ search: searchValue }) => {
		setValue('search', '');
		searchValue = searchValue.trim();
		if (searchValue && searchValue !== 'Search') {
			socket.emit('uniSearch', { searchValue, user });
		}
	};

	const handleFocus = () => {
		const value = getValues('search');
		if (value === 'Search') {
			setValue('search', '');
		}
	};

	const handleBlur = () => {
		const value = getValues('search');
		if (value === '') {
			setValue('search', 'Search');
		}
	};

	return (
		<form className='search-form' onSubmit={handleSubmit(onSubmit)}>
			<div className='search-bar'>
				<FontAwesomeIcon className='search-icon' icon={faSearch} />
				<input
					{...register('search')}
					onFocus={() => handleFocus()}
					onBlur={() => handleBlur()}
				/>
				<button type='submit' className='submit-button'>
					<FontAwesomeIcon className='arrrow-icon' icon={faArrowRight} />
				</button>
			</div>
			<div className='search-header'>
				<p className='search-header-text track-title'>Tracks</p>
				<p className='search-header-text album-title'>Albums</p>
			</div>
		</form>
	);
}

export default UniSearchForm;
