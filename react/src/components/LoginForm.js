import React, { useState } from 'react';
import { LogIn, User } from 'lucide-react';
import './styling/LoginForm.css'; // or LoginForm.css if separated

const API_BASE = 'http://localhost:8000';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // local toggle state

  const handleSubmit = async () => {
    if (!formData.name || !formData.password) return;
    setLoading(true);

    try {
      const endpoint = isRegister ? '/register' : '/login';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        if (isRegister) {
          console.log('Registered! Now log in.');
          setFormData({ name: '', password: '' });
          setIsRegister(false);
        } else {
          const data = await res.json();
          onLogin(data.access_token);
        }
      } else {
        const error = await res.json();
        console.log(`Error: ${error.detail || 'Operation failed'}`);
      }
    } catch (err) {
      console.log('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {isRegister ? <User size={32} /> : <LogIn size={32} />}
          <h2>{isRegister ? 'Register' : 'Login'}</h2>
        </div>

        <input
          className="login-input"
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
          required
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={loading}
          required
        />

        <button 
          className="login-button" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
        </button>

        <div className="login-toggle" onClick={() => setIsRegister(!isRegister)}>
          {isRegister
            ? 'Already have an account? Log in'
            : "Don't have an account? Register"}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;