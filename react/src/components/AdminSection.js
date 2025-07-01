import React, { useState} from 'react';

const API_BASE = 'http://localhost:8000';

const AdminSection = ({ token, onPromoteSuccess }) => {

  const [username, setUsername] = useState('');

  const [loading, setLoading] = useState(false);



  const handlePromote = async () => {

    if (!username) return;

    setLoading(true);



    try {

      const res = await fetch(`${API_BASE}/admin/promote`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          Authorization: `Bearer ${token}`,

        },

        body: JSON.stringify({ username }),

      });



      if (res.ok) {

        console.log('User promoted to admin!'); // TODO: Replace with user-friendly UI feedback

        setUsername('');

        onPromoteSuccess();

      } else {

        const data = await res.json();

        console.log('Error promoting user: ' + (data.detail || JSON.stringify(data))); // TODO: Replace with user-friendly UI feedback));

      }

    } catch (err) {

      console.log('Network error: ' + err.message); // TODO: Replace with user-friendly UI feedback

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="bg-orange-50 rounded-lg shadow-md p-6 mb-6 border border-orange-200">

      <h3 className="text-lg font-semibold mb-4 text-orange-800">Admin Panel</h3>

      <div className="flex gap-4">

        <input

          type="text"

          placeholder="Username to promote"

          value={username}

          onChange={(e) => setUsername(e.target.value)}

          className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"

          required

        />

        <button

          onClick={handlePromote}

          disabled={loading}

          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"

        >

          {loading ? 'Promoting...' : 'Make Admin'}

        </button>

      </div>

    </div>

  );

};

export default AdminSection;