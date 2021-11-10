function formatSearchResults(searchResults, music_provider) {
	let necessaryTrackInfo = [];
	let necessaryAlbumInfo = [];

	if (music_provider === 'spotify') {
		const albums = searchResults.albums.items;
		const tracks = searchResults.tracks.items;

		necessaryTrackInfo = tracks.map((track) => {
			return {
				trackName: track.name,
				artists: track.artists.map(({ name }) => name).join(', '),
				trackCover: track.album.images[0].url,
				id: track.id,
				uniId: track.external_ids.isrc,
			};
		});

		necessaryAlbumInfo = albums.map((album) => {
			return {
				albumName: album.name,
				artists: album.artists.map(({ name }) => name).join(', '),
				albumCover: album.images[0].url,
				id: album.id,
				songCount: album.total_tracks,
			};
		});
	} else {
		if (searchResults.songs) {
			const tracks = searchResults.songs.data;
			necessaryTrackInfo = tracks.map((track) => {
				return {
					href: track.href,
					type: track.type,
					trackName: track.attributes.name,
					artists: track.attributes.artistName,
					trackCover: track.attributes.artwork.url.replace(
						'{w}x{h}',
						'640x640'
					),
					id: track.id,
					uniId: track.attributes.isrc,
				};
			});
		}
		if (searchResults.albums) {
			const albums = searchResults.albums.data;
			necessaryAlbumInfo = albums.map((album) => {
				return {
					albumName: album.attributes.name,
					artists: album.attributes.artistName,
					albumCover: album.attributes.artwork.url.replace(
						'{w}x{h}',
						'640x640'
					),
					id: album.id,
					songCount: album.attributes.trackCount,
				};
			});
		}
	}

	return { tracks: necessaryTrackInfo, albums: necessaryAlbumInfo };
}

function formatSongForApple({ href, type, id }) {
	return { href, type, id };
}

module.exports = {
	formatSearchResults,
	formatSongForApple,
};
exports = module.exports;
