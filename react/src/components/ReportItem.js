import React, { useState } from 'react';
import { Edit, History, Trash2, User, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="report-card group">
      {/* Header Section */}
      <div className="report-card-header">
        <div className="report-card-title-section">
          <h4 className="report-card-title">{report.title}</h4>
          <div className="report-card-meta">
            <div className="neuro-meta-item">
              <Calendar className="w-4 h-4" />
              <span>{reportDate.toLocaleDateString()}</span>
            </div>
            <div className="neuro-meta-item">
              <Clock className="w-4 h-4" />
              <span>{reportDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="neuro-meta-item">
              <User className="w-4 h-4" />
              <span>{username}</span>
            </div>
            {report.edited && (
              <div className="neuro-badge bg-orange-100">
                Edited
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="report-card-actions">
          <button
            onClick={handleEdit}
            className="neuro-btn-icon neuro-btn-edit"
            title="Edit Report"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={toggleHistory}
            className={`neuro-btn-icon neuro-btn-history ${showHistory ? 'active' : ''}`}
            title="View History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="neuro-btn-icon neuro-btn-delete"
            title="Delete Report"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="report-card-content">
        <p className="report-card-summary">{displaySummary}</p>
        {isLongSummary && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="neuro-btn-expand"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show More
              </>
            )}
          </button>
        )}
      </div>

      {/* History Section */}
      {showHistory && (
        <div className="report-card-history">
          <div className="neuro-divider"></div>
          <div className="report-card-history-header">
            <h5 className="report-card-history-title">Version History</h5>
          </div>
          
          {loadingHistory ? (
            <div className="report-card-history-loading">
              <div className="neuro-loader"></div>
              <span>Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="report-card-history-empty">
              <History className="w-8 h-8 text-gray-300" />
              <p>No version history available</p>
            </div>
          ) : (
            <div className="report-card-history-list">
              {history.map((version, index) => {
                const editedBy = version.edited_by && version.edited_by.name ? version.edited_by.name : 'Unknown';
                const versionDate = new Date(version.date);
                const savedDate = new Date(version.saved_at);
                
                return (
                  <div key={index} className="neuro-history-item">
                    <div className="neuro-history-header">
                      <h6 className="neuro-history-title">{version.title}</h6>
                      <div className="neuro-history-date">
                        <Calendar className="w-3 h-3" />
                        <span>{versionDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="neuro-history-summary">{version.summary}</p>
                    <div className="neuro-history-meta">
                      <div className="neuro-history-meta-item">
                        <Clock className="w-3 h-3" />
                        <span>Saved: {savedDate.toLocaleString()}</span>
                      </div>
                      <div className="neuro-history-meta-item">
                        <User className="w-3 h-3" />
                        <span>By: {editedBy}</span>
                      </div>
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

export default ReportItem;