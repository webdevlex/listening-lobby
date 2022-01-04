import React, { useEffect } from 'react';
import LobbyTrackDisplay from '../lobby-track-display/LobbyTrackDisplay';
import LobbyQueue from '../lobby-queue/LobbyQueue';
import LobbySearch from '../lobby-search/LobbySearch';
import LobbyMembers from '../../components/lobby-members/LobbyMembers';
import LobbyMessages from '../../components/lobby-messages/LobbyMessages';
import FullAlbum from '../full-album/FullAlbum';
import useWindowSize from '../../hooks/hooks';
import './lobby-center.scss';

export default function LobbyCenter({
	setCenterDisplay,
	centerDisplay,
	queue,
	user,
	buttonsClickable,
	likedSongs,
	setLikedSongs,
	albums,
	setAlbums,
	tracks,
	setTracks,
	playing,
	beenAdded,
	searchLoading,
	setSearchLoading,
	percent,
	currentTime,
	members,
	adminId,
	messages,
	setDisplayInvitePopup,
	fullAlbum,
	setFullAlbum,
	setDisplayFullAlbum,
	displayFullAlbum,
}) {
	const [width] = useWindowSize();

	useEffect(() => {
		const noLongerOnMobile = width > 850;
		const isOnPageThatDoesntExistsOnMobile =
			centerDisplay === 'messages' || centerDisplay === 'members';

		if (noLongerOnMobile && isOnPageThatDoesntExistsOnMobile) {
			setCenterDisplay('player');
		}

		if (fullAlbum && displayFullAlbum) {
			setDisplayFullAlbum(false);
			setCenterDisplay('fullAlbum');
		}
	}, [
		centerDisplay,
		setCenterDisplay,
		width,
		fullAlbum,
		displayFullAlbum,
		setDisplayFullAlbum,
	]);

	switch (centerDisplay) {
		case 'player':
			return (
				<div className='lobby-center-queue-wrapper'>
					<LobbyTrackDisplay
						queue={queue}
						percent={percent}
						currentTime={currentTime}
					/>
					<LobbyQueue
						queue={queue}
						user={user}
						buttonsClickable={buttonsClickable}
						likedSongs={likedSongs}
						setLikedSongs={setLikedSongs}
						playing={playing}
					/>
				</div>
			);
		case 'search':
			return (
				<LobbySearch
					user={user}
					buttonsClickable={buttonsClickable}
					albums={albums}
					setAlbums={setAlbums}
					tracks={tracks}
					setTracks={setTracks}
					beenAdded={beenAdded}
					searchLoading={searchLoading}
					setSearchLoading={setSearchLoading}
				/>
			);
		case 'messages':
			return <LobbyMessages messages={messages} user={user} />;
		case 'members':
			return (
				<LobbyMembers
					members={members}
					adminId={adminId}
					displayInvitePopup={true}
					setDisplayInvitePopup={setDisplayInvitePopup}
					user={user}
				/>
			);
		case 'fullAlbum':
			return (
				<FullAlbum
					user={user}
					buttonsClickable={buttonsClickable}
					beenAdded={beenAdded}
					searchLoading={searchLoading}
					setSearchLoading={setSearchLoading}
					fullAlbum={fullAlbum}
					setCenterDisplay={setCenterDisplay}
					setFullAlbum={setFullAlbum}
				/>
			);
		default:
			return null;
	}
}
