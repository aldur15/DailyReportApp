import React, { useState, useEffect } from 'react';

import "./Components.css"

const API_BASE = 'http://localhost:8000';

const AdminSection = ({ token, onPromoteSuccess }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Reports analytics state
  const [reports, setReports] = useState([]);
  const [reportsPeriod, setReportsPeriod] = useState('week'); // 'week', 'month', 'year'
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  
  // Date selection state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  // Helper function to get current week number
  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  // Helper function to get week date range
  function getWeekDateRange(year, weekNumber) {
    const start = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7 - start.getDay();
    const weekStart = new Date(year, 0, 1 + daysToAdd);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { start: weekStart, end: weekEnd };
  }

  const fetchAllReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fetchedReports = await res.json();
        setReports(fetchedReports);
        calculateReportCount(fetchedReports);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const calculateReportCount = (reportsData) => {
    let startDate, endDate;

    switch (reportsPeriod) {
      case 'week':
        const weekRange = getWeekDateRange(selectedYear, selectedWeek);
        startDate = weekRange.start;
        endDate = weekRange.end;
        break;
      case 'month':
        startDate = new Date(selectedYear, selectedMonth - 1, 1);
        endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
        break;
      case 'year':
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        break;
      default:
        startDate = new Date();
        endDate = new Date();
    }

    const filteredReports = reportsData.filter(report => {
      const reportDate = new Date(report.created_at || report.timestamp || report.date);
      return reportDate >= startDate && reportDate <= endDate;
    });

    setReportCount(filteredReports.length);
  };

  const handlePeriodChange = (newPeriod) => {
    setReportsPeriod(newPeriod);
  };

  // Fetch reports when component mounts
  useEffect(() => {
    fetchAllReports();
  }, []);

  // Recalculate when period or date selections change
  useEffect(() => {
    if (reports.length > 0) {
      calculateReportCount(reports);
    }
  }, [reportsPeriod, selectedYear, selectedMonth, selectedWeek]);

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

  const getPeriodLabel = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    switch (reportsPeriod) {
      case 'week': 
        const weekRange = getWeekDateRange(selectedYear, selectedWeek);
        return `Week ${selectedWeek}, ${selectedYear} (${weekRange.start.toLocaleDateString()} - ${weekRange.end.toLocaleDateString()})`;
      case 'month': 
        return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
      case 'year': 
        return `Year ${selectedYear}`;
      default: 
        return 'Selected Period';
    }
  };

  // Generate years for dropdown (current year ± 10 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 2; year++) {
      years.push(year);
    }
    return years;
  };

  // Generate weeks for dropdown (1-53)
  const generateWeeks = () => {
    const weeks = [];
    for (let week = 1; week <= 53; week++) {
      weeks.push(week);
    }
    return weeks;
  };

  return (
    <div className="bg-orange-50 rounded-lg shadow-md p-6 mb-6 border border-orange-200">
      <h3 className="text-lg font-semibold mb-4 text-orange-800">Admin Panel</h3>
      
      {/* User Promotion Section */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-3 text-orange-700">User Management</h4>
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

      {/* Reports Analytics Section */}
      <div>
        <h4 className="text-md font-medium mb-3 text-orange-700">Reports Analytics</h4>
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={reportsPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-3 py-1 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
              
              {/* Year selector (always shown) */}
              <label className="text-sm font-medium text-gray-700">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 text-sm"
              >
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              {/* Month selector (shown for week and month periods) */}
              {(reportsPeriod === 'month' || reportsPeriod === 'week') && (
                <>
                  <label className="text-sm font-medium text-gray-700">Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-1 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value={1}>January</option>
                    <option value={2}>February</option>
                    <option value={3}>March</option>
                    <option value={4}>April</option>
                    <option value={5}>May</option>
                    <option value={6}>June</option>
                    <option value={7}>July</option>
                    <option value={8}>August</option>
                    <option value={9}>September</option>
                    <option value={10}>October</option>
                    <option value={11}>November</option>
                    <option value={12}>December</option>
                  </select>
                </>
              )}
              
              {/* Week selector (shown only for week period) */}
              {reportsPeriod === 'week' && (
                <>
                  <label className="text-sm font-medium text-gray-700">Week:</label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="px-3 py-1 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {generateWeeks().map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <button
              onClick={fetchAllReports}
              disabled={reportsLoading}
              className="px-4 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm"
            >
              {reportsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {reportsLoading ? '...' : reportCount}
            </div>
            <div className="text-sm text-gray-600">
              Reports created in {getPeriodLabel()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;