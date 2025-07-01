import React, { useState, useEffect} from 'react';
import {LogOut, Calendar} from 'lucide-react';

import AdminSection from './AdminSection';
import Navigation from './Navigation';
import ReportForm from './ReportForm';
import ReportItem from './ReportItem';
import SearchFilters from './SearchFilters';

import "./Components.css"

const API_BASE = 'http://localhost:8000';



const Dashboard = ({ token, onLogout }) => {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('create'); // New state for navigation

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
      console.log('Error fetching filtered reports');
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

  const handleReportSubmitted = () => {
    checkUser();
    setCurrentPage('reports'); // Navigate to reports page after creating
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'create':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Daily Report</h2>
            <ReportForm token={token} onReportSubmitted={handleReportSubmitted} />
          </div>
        );
      
      case 'reports':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Reports</h2>
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
          </div>
        );
      
      case 'admin':
        return user?.is_admin ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>
            <AdminSection token={token} onPromoteSuccess={checkUser} />
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

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

      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        isAdmin={user?.is_admin} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default Dashboard;