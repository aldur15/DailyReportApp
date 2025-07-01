import React, { useState} from 'react';
//import { LogIn, LogOut, User, Search, Calendar, Filter, Plus, Edit, History, Trash2, Eye, EyeOff } from 'lucide-react';

//Main Component Import

import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';




//Utils Import


import "./App.css"

//const API_BASE = 'http://localhost:8000';




// Utility functions





// Login Component




// Report Form Component



// Search/Filter Component





// Report Item Component





// Admin Section Component





// Main Dashboard Component


// Main App Component

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