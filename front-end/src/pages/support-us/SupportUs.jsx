import React from 'react';
import './support-us.scss';

export default function SupportUs() {
	return (
		<div className='support-us-page'>
			<div className='support-us-page-container'>
				<h1>Support Us with money!</h1>
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. In ad illo,
					asperiores cupiditate fuga architecto animi voluptatum quis accusamus
					provident. Provident atque excepturi libero perspiciatis quisquam
					magni eum quidem delectus non, quas a ullam in dignissimos deserunt
					modi alias eaque! Unde asperiores iste ab, at quas numquam deleniti
					quam quasi.
				</p>
				<div className='buttons-container'>
					<button className='default-buttons'>Donate</button>
					<button className='default-buttons'>Dont Donate</button>
				</div>

				<div className='img-container'>
					<div className='img-1'></div>
					<div className='img-2'></div>
				</div>
			</div>
		</div>
	);
}
