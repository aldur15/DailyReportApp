import React, { useState } from 'react';
import { Edit, History, Trash2, User, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

import './styling/ReportItem.css';

const API_BASE = 'http://localhost:8000';

const ReportItem = ({ report, token, onUpdate, onDelete }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
        console.log('Failed to load history');
      } finally {
        setLoadingHistory(false);
      }
    }
    setShowHistory(!showHistory);
  };

  const username = report.username || (report.user && report.user.name) || 'Unknown';
  const reportDate = new Date(report.date);
  const isLongSummary = report.summary && report.summary.length > 200;
  const displaySummary = isExpanded || !isLongSummary ? report.summary : report.summary?.substring(0, 200) + '...';

  return (
    <div className="report-item">
      <div className="report-header">
        <h3 className="report-title">{report.title}</h3>
        <div className="report-actions">
          <button className="report-button" onClick={handleEdit}>
            <Edit size={16} />
          </button>
          <button className="report-button" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
          <button className="report-button" onClick={toggleHistory}>
            <History size={16} />
          </button>
          <button className="report-button" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="report-body">
          <p className="report-summary">{displaySummary}</p>
          <div className="report-meta">
            <span><Calendar size={14} /> {reportDate.toLocaleDateString()}</span>
            <span><Clock size={14} /> {reportDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span><User size={14} /> {username}</span>
            {report.edited && (
              <span className="report-edited-badge">Edited</span>
            )}
          </div>
        </div>
      )}

      {showHistory && (
        <div className="report-history">
          <h4>Edit History</h4>
          {loadingHistory ? (
            <p>Loading history...</p>
          ) : history.length === 0 ? (
            <div className="report-history-empty">
              <History size={32} />
              <p>No version history available</p>
            </div>
          ) : (
            <ul>
              {history.map((version, index) => {
                const editedBy = version.edited_by && version.edited_by.name ? version.edited_by.name : 'Unknown';
                const versionDate = new Date(version.date);
                const savedDate = new Date(version.saved_at);
                
                return (
                  <li key={index}>
                    <div className="history-item-header">
                      <h6 className="history-title">{version.title}</h6>
                      <div className="history-date">
                        <Calendar size={12} />
                        <span>{versionDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="history-summary">{version.summary}</p>
                    <div className="history-meta">
                      <div className="history-meta-item">
                        <Clock size={12} />
                        <span>Saved: {savedDate.toLocaleString()}</span>
                      </div>
                      <div className="history-meta-item">
                        <User size={12} />
                        <span>By: {editedBy}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportItem;