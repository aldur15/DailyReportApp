import React, { useState } from 'react';
import { LogIn, User } from 'lucide-react';
import "./Components.css";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRegister ? 'Register' : 'Login'}
          </h2>
        </div>

        <div className="space-y-6">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
          </button>

          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-indigo-600 text-sm mt-2 underline hover:text-indigo-800 transition"
          >
            {isRegister
              ? 'Already have an account? Log in'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
