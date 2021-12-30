import React, { useState } from 'react';
import { PlayersProvider } from './context/PlayersContext';
import { SocketContextProvider } from './context/SocketContext';
import Home from './pages/home/Home';
import EarlyAccess from './pages/early-access/EarlyAccess';
import ChooseService from './pages/choose-service/ChooseService';
import Lobby from './pages/lobby/Lobby';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PrivateRoute from './routing/PrivateRoute';
import './App.scss';

const WEBSITE_PRIVATE = true;

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(
		JSON.parse(localStorage.getItem('earlyAccessAuth'))
	);

	return (
		<SocketContextProvider>
			<PlayersProvider>
				<div className='App'>
					<Router>
						<Switch>
							<Route
								path='/early-access'
								exact
								component={() => (
									<EarlyAccess
										isAuthenticated={isAuthenticated}
										setIsAuthenticated={setIsAuthenticated}
										websitePrivate={WEBSITE_PRIVATE}
									/>
								)}
							/>
							<PrivateRoute
								path='/'
								exact
								component={Home}
								isAuthenticated={isAuthenticated}
							/>
							<PrivateRoute
								path='/choose-service'
								exact
								component={ChooseService}
								isAuthenticated={isAuthenticated}
							/>
							<PrivateRoute
								path='/lobby'
								component={Lobby}
								isAuthenticated={isAuthenticated}
							/>
						</Switch>
					</Router>
				</div>
			</PlayersProvider>
		</SocketContextProvider>
	);
}

export default App;
