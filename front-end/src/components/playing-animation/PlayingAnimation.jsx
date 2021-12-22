import React from 'react';
import './playing-animation.scss';

export default function PlayingAnimation() {
	return (
		<div className='playing'>
			<span className='playing__bar playing__bar1'></span>
			<span className='playing__bar playing__bar2'></span>
			<span className='playing__bar playing__bar3'></span>
		</div>
	);
}
