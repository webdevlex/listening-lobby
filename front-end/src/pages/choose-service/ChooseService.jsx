import React from 'react';
import { useForm } from 'react-hook-form';
import MusicProviderButtons from '../../components/music-provider-buttons/MusicProviderButtons';
import MusicProviderForm from '../../components/music-provider-form/MusicProviderForm';
import './choose-service.scss';

function ChooseService() {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm();

	return (
		<div className='choose-service'>
			<h1>Choose a service</h1>
			<MusicProviderButtons errors={errors} setValue={setValue} />
			<MusicProviderForm
				handleSubmit={handleSubmit}
				register={register}
				errors={errors}
			/>
		</div>
	);
}

export default ChooseService;
