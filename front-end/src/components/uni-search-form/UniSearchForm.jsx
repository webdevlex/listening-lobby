import React, { useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { SocketContext } from '../../context/SocketContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import './search-form.scss';

function UniSearchForm({
	setTracks,
	setAlbums,
	user,
	searchTabSelected,
	setSearchTabSelected,
	setSearchLoading,
	artistSearch,
	setArtistSearch,
}) {
	const { register, handleSubmit, setValue, getValues } = useForm({
		defaultValues: {
			search: 'Search',
		},
	});
	const [socket] = useContext(SocketContext);
	// const refresh_token = params.get('refresh_token');

	useEffect(() => {
		return () => {
			setArtistSearch(null);
		};
	}, [socket, setAlbums, setTracks, setArtistSearch]);

	const onSubmit = ({ search: searchValue }) => {
		setArtistSearch(null);
		searchValue = searchValue.trim();
		if (searchValue && searchValue !== 'Search') {
			document.activeElement.blur();
			setValue('search', 'Search');
			setSearchLoading(true);
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
					autoComplete='off'
					{...register('search')}
					onFocus={() => handleFocus()}
					onBlur={() => handleBlur()}
				/>
				<button type='submit' className='submit-button'>
					<FontAwesomeIcon className='arrrow-icon' icon={faArrowRight} />
				</button>
			</div>
			{artistSearch ? (
				<p className='large-artist-name'>{artistSearch}</p>
			) : null}
			<div className='search-header'>
				<p
					className={`search-header-text track-title ${
						searchTabSelected === 'tracks' ? 'selected' : null
					}`}
					onClick={() => setSearchTabSelected('tracks')}>
					Tracks
				</p>
				<p
					className={`search-header-text album-title ${
						searchTabSelected === 'albums' ? 'selected' : null
					}`}
					onClick={() => setSearchTabSelected('albums')}>
					Albums
				</p>
			</div>
		</form>
	);
}

export default UniSearchForm;
