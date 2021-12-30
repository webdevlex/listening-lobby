import React from 'react';
import { PlayersProvider } from './context/PlayersContext';
import { SocketContextProvider } from './context/SocketContext';
import Home from './pages/home/Home';
import ChooseService from './pages/choose-service/ChooseService';
import Lobby from './pages/lobby/Lobby';
import SupportUs from './pages/support-us/SupportUs';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.scss';

function App() {
	return (
		<SocketContextProvider>
			<PlayersProvider>
				<div className='App'>
					<Router>
						<Switch>
							<Route path='/' exact component={Home} />
							<Route path='/support-us' component={SupportUs} />
							<Route path='/choose-service' exact component={ChooseService} />
							<Route path='/lobby' component={Lobby} />
						</Switch>
					</Router>
				</div>
			</PlayersProvider>
		</SocketContextProvider>
	);
}

export default App;
