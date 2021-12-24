import React from 'react';
import './time-bar.scss';

export default function TimeBar({ percent, currentTime, song }) {
	function formatDuration(millis) {
		var minutes = Math.floor(millis / 60000);
		var seconds = ((millis % 60000) / 1000).toFixed(0);
		return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	}

	return (
		<div className='time-bar-container'>
			<p className='current-time time'>{formatDuration(currentTime)}</p>
			<div className='time-bar'>
				<div className='time-bar-slider' style={{ left: `${percent}%` }}></div>
			</div>
			<p className='total-time time'>
				{song ? song.ui.formattedDuration : '0:00'}
			</p>
		</div>
	);
}
