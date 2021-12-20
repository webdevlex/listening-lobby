import React from 'react';
import { useForm } from 'react-hook-form';
import MusicProviderButtons from '../../components/music-provider-buttons/MusicProviderButtons';
import MusicProviderForm from '../../components/music-provider-form/MusicProviderForm';
import './choose-service.scss';

function ChooseService() {
	const params = new URLSearchParams(window.location.search);
	const action = params.get('action');
	const lobby_id = params.get('lobby_id');

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues: { lobby_id: lobby_id },
	});

	return (
		<div className='choose-service'>
			<h1>Choose a service</h1>
			<MusicProviderButtons errors={errors} setValue={setValue} />
			<MusicProviderForm
				handleSubmit={handleSubmit}
				register={register}
				errors={errors}
				action={action}
				lobby_id={lobby_id}
			/>
		</div>
	);
}

export default ChooseService;
