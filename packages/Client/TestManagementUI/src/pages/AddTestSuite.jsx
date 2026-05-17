import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = '/api';

const AddTestSuite = ({ selectedRelease }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a suite name.');
      return;
    }
    if (!selectedRelease) {
      alert('No active release selected. Please select a release first.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/testsuite/testsuite`, {
        name,
        description,
        releaseid: Number(selectedRelease),
        statusid: 1
      });
      setLoading(false);
      navigate('/suites');
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Failed to create test suite: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Test Suite</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="suite-name" className="block text-sm font-semibold text-slate-700 mb-2">Suite Name</label>
            <input
              id="suite-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Authentication Flow Specs"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="suite-description" className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              id="suite-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scope of this test suite..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="release-id" className="block text-sm font-semibold text-slate-700 mb-2">Associated Release ID</label>
            <input
              id="release-id"
              type="text"
              value={selectedRelease || 'No Release Selected'}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/suites')}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? 'Creating...' : 'Add Suite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTestSuite;
