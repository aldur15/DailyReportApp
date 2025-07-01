import React, { useState, useEffect, useCallback } from 'react';

import { LogIn, LogOut, User, Search, Calendar, Filter, Plus, Edit, History, Trash2, Eye, EyeOff } from 'lucide-react';
import "./App.css"


const API_BASE = 'http://localhost:8000';





// Utility functions

const debounce = (func, delay) => {

  let timeoutId;

  return (...args) => {

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => func.apply(null, args), delay);

  };

};



// Login Component

const LoginForm = ({ onLogin, isRegister = false }) => {

  const [formData, setFormData] = useState({ name: '', password: '' });

  const [loading, setLoading] = useState(false);



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

          console.log('Registered! Now log in.'); // TODO: Replace with user-friendly UI feedback

          setFormData({ name: '', password: '' });

        } else {

          const data = await res.json();

          onLogin(data.access_token);

        }

      } else {

        const error = await res.json();

        console.log(`Error: ${error.detail || 'Operation failed'}`); // TODO: Replace with user-friendly UI feedback

      }

    } catch (err) {

      console.log('Network error: ' + err.message); // TODO: Replace with user-friendly UI feedback

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

          <h2 className="text-2xl font-bold text-gray-900">{isRegister ? 'Register' : 'Login'}</h2>

        </div>

        

        <div className="space-y-6">

          <div>

            <input

              type="text"

              placeholder="Name"

              value={formData.name}

              onChange={(e) => setFormData({ ...formData, name: e.target.value })}

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"

              required

            />

          </div>

          <div>

            <input

              type="password"

              placeholder="Password"

              value={formData.password}

              onChange={(e) => setFormData({ ...formData, password: e.target.value })}

              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"

              required

            />

          </div>

          <button

            onClick={handleSubmit}

            disabled={loading}

            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"

          >

            <LogIn className="w-4 h-4" />

            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}

          </button>

        </div>

      </div>

    </div>

  );

};



// Report Form Component

const ReportForm = ({ token, onReportSubmitted }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  // FIXED: Added event parameter and preventDefault
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!formData.title || !formData.summary) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        console.log('Report submitted!');
        setFormData({ title: '', summary: '', date: new Date().toISOString().split('T')[0] });
        onReportSubmitted();
      } else {
        const data = await res.json();
        console.log('Error submitting report: ' + (data.detail || JSON.stringify(data)));
      }
    } catch (err) {
      console.log('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Create Daily Report
      </h3>

      {/* FIXED: Added onSubmit handler to form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Report title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
        <textarea
          placeholder="What happened today?"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
          required
        />
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

// Search/Filter Component

const SearchFilters = ({ onFilter, onClear, onShowAll, onHideAll }) => {

  const [filters, setFilters] = useState({

    username: '',

    title: '',

    date: '',

    month: ''

  });



  const debouncedFilter = useCallback(

    debounce((filterData) => onFilter(filterData), 300),

    [onFilter]

  );



  const handleFilterChange = (key, value) => {

    const newFilters = { ...filters, [key]: value };

    setFilters(newFilters);

    debouncedFilter(newFilters);

  };



  const handleClear = () => {

    setFilters({ username: '', title: '', date: '', month: '' });

    onClear();

  };



  return (

    <div className="bg-white rounded-lg shadow-md p-6 mb-6">

      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">

        <Search className="w-5 h-5" />

        Search Daily Reports

      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

        <input

          type="text"

          placeholder="Search by username"

          value={filters.username}

          onChange={(e) => handleFilterChange('username', e.target.value)}

          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

        />

        <input

          type="text"

          placeholder="Search by title"

          value={filters.title}

          onChange={(e) => handleFilterChange('title', e.target.value)}

          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

        />

        <input

          type="date"

          value={filters.date}

          onChange={(e) => handleFilterChange('date', e.target.value)}

          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

        />

        <input

          type="month"

          value={filters.month}

          onChange={(e) => handleFilterChange('month', e.target.value)}

          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

        />

      </div>

      <div className="flex flex-wrap gap-2">

        <button

          onClick={handleClear}

          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"

        >

          <Filter className="w-4 h-4" />

          Clear Filters

        </button>

        <button

          onClick={onShowAll}

          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"

        >

          <Eye className="w-4 h-4" />

          Show All

        </button>

        <button

          onClick={onHideAll}

          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"

        >

          <EyeOff className="w-4 h-4" />

          Hide All

        </button>

      </div>

    </div>

  );

};



// Report Item Component

const ReportItem = ({ report, token, onUpdate, onDelete }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleEdit = () => {
    const newTitle = prompt('New title:', report.title);
    if (newTitle === null) return;
    const newSummary = prompt('New summary:', report.summary);
    if (newSummary === null) return;
    const newDate = prompt('New date:', report.date);
    if (newDate === null) return;

    fetch(`${API_BASE}/reports/${report.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle, summary: newSummary, date: newDate }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.detail) {
          console.log('Error updating report: ' + JSON.stringify(data));
        } else {
          console.log('Report updated');
          onUpdate();
        }
      });
  };
  



  const handleDelete = () => {
    const userConfirmed = window.confirm('Are you sure you want to delete this report? This action cannot be undone.');
    if (!userConfirmed) return;

    fetch(`${API_BASE}/reports/${report.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) {
          console.log('Report deleted.');
          onDelete();
        } else {
          return res.json().then(data => {
            console.log('Error deleting report: ' + (data.detail || JSON.stringify(data)));
          });
        }
      })
      .catch(err => console.log('Request failed: ' + err));
  };



  const toggleHistory = async () => {

    if (!showHistory) {

      setLoadingHistory(true);

      try {

        const res = await fetch(`${API_BASE}/reports/${report.id}/history`, {

          headers: { Authorization: `Bearer ${token}` },

        });

        const historyData = await res.json();

        setHistory(historyData);

      } catch (err) {

        console.log('Failed to load history'); // TODO: Replace with user-friendly UI feedback

      } finally {

        setLoadingHistory(false);

      }

    }

    setShowHistory(!showHistory);

  };



  const username = report.username || (report.user && report.user.name) || 'Unknown';



  return (

    <div className="bg-white rounded-lg shadow-md p-6 mb-4">

      <div className="flex justify-between items-start mb-4">

        <div>

          <h4 className="text-xl font-semibold text-gray-900">{report.title}</h4>

          <p className="text-sm text-gray-500">

            {new Date(report.date).toLocaleString()} • By: {username}

            {report.edited && <span className="text-orange-500 ml-2">(edited)</span>}

          </p>

        </div>

        <div className="flex gap-2">

          <button

            onClick={handleEdit}

            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

            title="Edit"

          >

            <Edit className="w-4 h-4" />

          </button>

          <button

            onClick={toggleHistory}

            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"

            title="Toggle History"

          >

            <History className="w-4 h-4" />

          </button>

          <button

            onClick={handleDelete}

            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"

            title="Delete"

          >

            <Trash2 className="w-4 h-4" />

          </button>

        </div>

      </div>

      

      <p className="text-gray-700 mb-4">{report.summary}</p>

      

      {showHistory && (

        <div className="border-t pt-4">

          <h5 className="font-semibold text-gray-900 mb-3">History</h5>

          {loadingHistory ? (

            <p className="text-gray-500">Loading history...</p>

          ) : history.length === 0 ? (

            <p className="text-gray-500">No history available.</p>

          ) : (

            <div className="space-y-3">

              {history.map((version, index) => {

                const editedBy = version.edited_by && version.edited_by.name ? version.edited_by.name : 'Unknown';

                return (

                  <div key={index} className="bg-gray-50 rounded-lg p-4">

                    <div className="flex justify-between items-start mb-2">

                      <h6 className="font-medium">{version.title}</h6>

                      <span className="text-xs text-gray-500">

                        {new Date(version.date).toLocaleString()}

                      </span>

                    </div>

                    <p className="text-sm text-gray-600 mb-2">{version.summary}</p>

                    <div className="text-xs text-gray-500">

                      Saved: {new Date(version.saved_at).toLocaleString()} • 

                      Edited by: {editedBy}

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </div>

      )}

    </div>

  );

};



// Admin Section Component

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



// Main Dashboard Component

const Dashboard = ({ token, onLogout }) => {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        if (userData.is_admin) {
          fetchAllReports();
        } else {
          fetchMyReports();
        }
      } else {
        console.log('Session expired');
        onLogout();
      }
    } catch (err) {
      console.log('Network error: ' + err.message);
      onLogout();
    } finally {
      setLoading(false);
    }
  };



  const fetchAllReports = async () => {

    try {

      const res = await fetch(`${API_BASE}/reports`, {

        headers: { Authorization: `Bearer ${token}` },

      });

      if (res.ok) {

        setReports(await res.json());

      }

    } catch (err) {

      console.error('Failed to fetch reports:', err);

    }

  };



  const fetchMyReports = async () => {

    try {

      const res = await fetch(`${API_BASE}/reports/mine`, {

        headers: { Authorization: `Bearer ${token}` },

      });

      if (res.ok) {

        setReports(await res.json());

      }

    } catch (err) {

      console.error('Failed to fetch my reports:', err);

    }

  };



  const fetchFilteredReports = async (filters) => {

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {

      if (value) {

        if (key === 'month') {

          const [year, monthNum] = value.split('-');

          params.append('month', monthNum);

          params.append('year', year);

        } else {

          params.append(key, value);

        }

      }

    });



    try {

      const res = await fetch(`${API_BASE}/reports/search?${params.toString()}`, {

        headers: { Authorization: `Bearer ${token}` },

      });

      if (res.ok) {

        setReports(await res.json());

      }

    } catch (err) {

      console.log('Error fetching filtered reports'); // TODO: Replace with user-friendly UI feedback

    }

  };



  const handleClearFilters = () => {

    if (user?.is_admin) {

      fetchAllReports();

    } else {

      fetchMyReports();

    }

  };



  const handleShowAll = () => {

    if (user?.is_admin) {

      fetchAllReports();

    } else {

      fetchMyReports();

    }

  };



  const handleHideAll = () => {

    setReports([]);

  };



  useEffect(() => {
    checkUser();
  }, [token]);



  if (loading) {

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>

          <p className="text-gray-600">Loading...</p>

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gray-50">

      <header className="bg-white shadow-sm border-b">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-16">

            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="flex items-center gap-4">

              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>

              {user?.is_admin && (

                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Admin</span>

              )}

              <button

                onClick={onLogout}

                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"

              >

                <LogOut className="w-4 h-4" />

                Logout

              </button>

            </div>

          </div>

        </div>

      </header>



      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <ReportForm token={token} onReportSubmitted={checkUser} />

        

        {user?.is_admin && (

          <AdminSection token={token} onPromoteSuccess={checkUser} />

        )}

        

        <SearchFilters

          onFilter={fetchFilteredReports}

          onClear={handleClearFilters}

          onShowAll={handleShowAll}

          onHideAll={handleHideAll}

        />

        

        <div className="space-y-4">

          {reports.length === 0 ? (

            <div className="text-center py-12">

              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />

              <p className="text-gray-500 text-lg">No reports found</p>

            </div>

          ) : (

            reports.map(report => (

              <ReportItem

                key={report.id}

                report={report}

                token={token}

                onUpdate={checkUser}

                onDelete={checkUser}

              />

            ))

          )}

        </div>

      </main>

    </div>

  );

};



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