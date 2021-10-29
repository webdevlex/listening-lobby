import React from 'react';
import { SocketContext, socket } from './context/socketContext';
import { AppleMusicProvider } from './context/AppleMusicContext';
import Home from './pages/home/Home';
import ChooseService from './pages/choose-service/ChooseService';
import Lobby from './pages/lobby/Lobby';
import {
	BrowserRouter as Router,
	Switch,
	Route,
} from 'react-router-dom';
import './App.scss';

function App() {
	return (
		<AppleMusicProvider>
			<SocketContext.Provider value={socket}>
				<div className='App'>
					<Router>
						<Switch>
							<Route path='/' exact component={Home} />
							<Route
								path='/choose-service'
								exact
								component={ChooseService}
							/>
							<Route path='/lobby' component={Lobby} />
						</Switch>
					</Router>
				</div>
			</SocketContext.Provider>
		</AppleMusicProvider>
	);
}

export default App;
