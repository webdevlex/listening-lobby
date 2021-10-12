import './App.css';

function App() {
	return (
		<div className='App'>
			<button
				onClick={() =>
					window.location.replace(
						'http://localhost:8888/spotify/login'
					)
				}></button>
		</div>
	);
}

export default App;
