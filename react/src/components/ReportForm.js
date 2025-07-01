import React, { useState} from 'react';
import { Plus} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

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


export default ReportForm;