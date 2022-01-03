const KICK_WAIT_TIME_IN_MILLIS = 10000;

const usersWhoAreReady = [{ user_id: 0 }, { user_id: 1 }];

const allUsers = [
	{ username: 'zero', user_id: 0 },
	{ username: 'one', user_id: 1 },
	{ username: 'two', user_id: 2 },
	{ username: 'three', user_id: 3 },
];

function waitSomeTimeThenKickAnyoneWhoIsNotReady(io, lobby_id) {
	kickAfterTimeInterval = setTimeout(() => {
		const usersWhoWillBeKicked = allUsers.filter(
			({ user_id }) => !containMatch(usersWhoAreReady, user_id)
		);
		kickUsers(io, usersWhoWillBeKicked);
	}, KICK_WAIT_TIME_IN_MILLIS);
}

function containMatch(arrayToCheck, idWeAreLookingFor) {
	return arrayToCheck.some(({ user_id }) => user_id === idWeAreLookingFor);
}

function kickUsers(io, users) {
	users.forEach(({ user_id, username }) => {
		console.log('kicking:', username);
	});
}

waitSomeTimeThenKickAnyoneWhoIsNotReady();
