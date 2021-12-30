import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, isAuthenticated }) => (
	<Route
		render={(props) =>
			isAuthenticated ? (
				<Component {...props} />
			) : (
				<Redirect to='/early-access' />
			)
		}
	/>
);

export default PrivateRoute;
