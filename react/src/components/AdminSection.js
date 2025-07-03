import React, { useState, useEffect } from 'react';

import './styling/AdminSection.css'; // Updated CSS import

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
    if (!username.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/promote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        setUsername('');
        if (typeof onPromoteSuccess === 'function') {
          onPromoteSuccess();
        }
        alert('User promoted successfully.');
      } else {
        const err = await res.json();
        alert(`Failed: ${err.detail || 'Unknown error'}`);
      }
    } catch (e) {
      alert('Network error.');
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
    <div className="admin-section">
      <div className="admin-card">
        <h2>Promote User to Admin</h2>
        <div className="input-group">
          <input
            className="admin-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            disabled={loading}
          />
          <button className="admin-button" onClick={handlePromote} disabled={loading}>
            {loading ? 'Promoting...' : 'Promote'}
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h2>Reports Overview</h2>
        <div className="analytics-controls">
          <select
            className="analytics-select"
            value={reportsPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>

          {/* Year selector (always shown) */}
          <select
            className="analytics-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {generateYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Month selector (shown for week and month periods) */}
          {(reportsPeriod === 'month' || reportsPeriod === 'week') && (
            <select
              className="analytics-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
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
          )}

          {/* Week selector (shown only for week period) */}
          {reportsPeriod === 'week' && (
            <select
              className="analytics-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            >
              {generateWeeks().map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
          )}

          <button
            className="admin-button"
            onClick={fetchAllReports}
            disabled={reportsLoading}
          >
            {reportsLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4b5d73', marginBottom: '0.5rem' }}>
            {reportsLoading ? '...' : reportCount}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Reports created in {getPeriodLabel()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;