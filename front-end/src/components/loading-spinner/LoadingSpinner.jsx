import React from 'react';
import './loading-spinner.scss';

export default function LoadingSpinner() {
	return (
		<div className='spinner-wrapper'>
			<div className='lds-spinner'>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
		</div>
	);
}
