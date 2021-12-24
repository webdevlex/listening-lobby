import { useLayoutEffect, useState } from 'react';

export default function useChildParentOverflow(parent, title, artists) {
	const [titleOverflow, setTitleOverflow] = useState(false);
	const [artistsOverflow, setArtistsOverflow] = useState(false);

	useLayoutEffect(() => {
		function updateSize() {
			const parentWidth = parent.current.offsetWidth;
			const titleWidth = title.current.offsetWidth;
			const artistsWidth = artists.current.offsetWidth;

			setTitleOverflow(parentWidth <= titleWidth);
			setArtistsOverflow(parentWidth <= artistsWidth);
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => window.removeEventListener('resize', updateSize);
	}, [parent, title, artists]);

	return { titleOverflow, artistsOverflow };
}
