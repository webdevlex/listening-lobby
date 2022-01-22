const fullAlbum = [
	{
		uniId: 'apple',
	},
	{
		uniId: 'apple',
	},
	{
		id: 'spot',
	},
];

const beenAdded = ['test'];

const test = beenAdded.some((addedId) =>
	fullAlbum.some(({ uniId, id }) => addedId === uniId || addedId === id)
);
console.log(test);
