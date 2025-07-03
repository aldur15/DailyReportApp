import React, { useState} from 'react';

import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';

//import "./App.css"

const App = () => {

  const [token, setToken] = useState(() => {

    // In a real app, you'd use a more secure storage method

    return null;

  });

  const [showRegister, setShowRegister] = useState(false);



  const handleLogin = (accessToken) => {

    setToken(accessToken);

  };



  const handleLogout = () => {

    setToken(null);

  };



  if (!token) {

    return (

      <div>

        <LoginForm onLogin={handleLogin} isRegister={showRegister} />

        <div className="fixed bottom-4 right-4">

          <button

            onClick={() => setShowRegister(!showRegister)}

            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"

          >

            {showRegister ? 'Go to Login' : 'Register'}

          </button>

        </div>

      </div>

    );

  }



  return <Dashboard token={token} onLogout={handleLogout} />;

};



export default App;