import React from 'react';
import { useForm } from 'react-hook-form';
import MusicProviderButtons from '../../components/music-provider-buttons/MusicProviderButtons';
import MusicProviderForm from '../../components/music-provider-form/MusicProviderForm';
import Header from '../../components/header/Header';
import './choose-service.scss';

function ChooseService() {
	const params = new URLSearchParams(window.location.search);
	const action = params.get('action');
	const lobby_id = params.get('lobby_id');

	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		setError,
		formState: { errors },
	} = useForm({
		defaultValues: {
			lobby_id: lobby_id || 'Lobby ID',
			username: 'Username',
		},
	});

	return (
		<div className='choose-service'>
			<Header />
			<div className='choose-service-text'>
				<h1 className='heading'>Choose your music provider</h1>
				<p className='sub-heading'>
					Login into you Apple Music or Spotify premium account
				</p>
			</div>

			<MusicProviderButtons errors={errors} setValue={setValue} />
			<MusicProviderForm
				handleSubmit={handleSubmit}
				register={register}
				errors={errors}
				action={action}
				lobby_id={lobby_id}
				getValues={getValues}
				setValue={setValue}
				setError={setError}
			/>
		</div>
	);
}

export default ChooseService;
