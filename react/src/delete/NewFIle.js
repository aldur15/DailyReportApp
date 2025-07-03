import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import './styling/ReportForm.css';

const API_BASE = 'http://localhost:8000';

const ReportForm = ({ token, onReportSubmitted }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setFormData({ title: '', summary: '', date: new Date().toISOString().split('T')[0] });
        if (typeof onReportSubmitted === 'function') onReportSubmitted();
        alert('Report submitted!');
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

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <h2 className="form-heading"><Plus size={20} /> Create New Report</h2>

      <input
        type="text"
        placeholder="Title"
        className="form-input"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        disabled={loading}
      />

      <textarea
        placeholder="Summary"
        className="form-textarea"
        value={formData.summary}
        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
        disabled={loading}
        rows={4}
      />

      <input
        type="date"
        className="form-input"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        disabled={loading}
      />

      <button className="form-button" type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
};

export default ReportForm;
