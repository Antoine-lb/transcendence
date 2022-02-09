import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';

function Home() {

	const [ logged, setLogged ] = useState(false);
	const [ login, setLogin ] = useState("");

	useEffect(() => {
		(async () => {
			const response = await fetch('/api/auth/status');
			const body = await response.json();
			console.log(body);

			if (body.isAuthenticated === true) {
				console.log("logged in");

				setLogged(true);
				setLogin(body.user.login);
			}
		})();
	}, [])

	return (
		<div>
			<h1>Home</h1>
			{
				logged ? (
					<div>
						<p>Logged as { login }</p>

						<button>
							<a href="/api/auth/logout">
								Logout
							</a>
						</button>
					</div>
				) : (
					<button>
						<a href="/api/auth/login">Status</a>
					</button>
				)
			}
		
		</div>
	)
}

function App() {
	return (
		<div>
			<Router>
				<Routes>
					<Route path='/' element={<Home />} />
				</Routes>
			</Router>
		</div>
	)
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);