const KICK_WAIT_TIME_IN_MILLIS = 5000;
const allUsers = [
	{ user_id: 0 },
	{ user_id: 1 },
	{ user_id: 2 },
	{ user_id: 3 },
];
const usersWhoAreReady = [{ user_id: 1 }, { user_id: 3 }];

function kickUsersWhoAreNotReady(io, lobby_id) {
	setTimeout(() => {
		const usersWhoWillBeKicked = allUsers.filter(
			({ user_id }) => !containsMatch(usersWhoAreReady, user_id)
		);
		kickUsers(io, usersWhoWillBeKicked);
	}, KICK_WAIT_TIME_IN_MILLIS);
}

function containsMatch(usersWhoAreReady, user_id) {
	return usersWhoAreReady.some((user) => user.user_id === user_id);
}

function kickUsers(io, users) {
	users.forEach(({ user_id }) => {
		console.log(user_id);
	});
}

kickUsersWhoAreNotReady();
