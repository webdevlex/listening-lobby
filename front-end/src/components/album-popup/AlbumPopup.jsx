import React, { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './album-popup.scss';

export default function AlbumPopup({
	displayAlbumQuestion,
	setDisplayAlbumQuestion,
	albumMissingOn,
	user,
	addedToQueue,
}) {
	const [socket] = useContext(SocketContext);

	function handleYes(user) {
		socket.emit('forceAlbum', { user, addedToQueue });
		setDisplayAlbumQuestion(false);
	}

	function handleNo() {
		setDisplayAlbumQuestion(false);
	}

	return displayAlbumQuestion ? (
		<div className='popup'>
			<div className='popup-container'>
				<div className='warning-icon-container'>
					<FontAwesomeIcon
						className='warning-icon'
						icon={faExclamationTriangle}
					/>
					<div className='exclamation-color'></div>
				</div>

				<div className='album-warning-text'>
					<h1>{`Album missing on ${albumMissingOn}!`}</h1>
					<span>{`${albumMissingOn} users wont be able to hear theses songs`}</span>
				</div>

				<div className='album-warning-buttons'>
					<button onClick={() => handleYes(user)}>Add</button>
					<button onClick={() => handleNo()}>Cancel</button>
				</div>
			</div>
		</div>
	) : null;
}
