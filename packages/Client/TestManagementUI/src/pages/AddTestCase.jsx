import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const API_BASE = '/api';

const AddTestCase = () => {
  const { testsuiteid } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prerequisite, setPrerequisite] = useState('');
  const [versionid, setVersionid] = useState('v1');
  const [statusid, setStatusid] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Test Case name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const testCasePayload = {
        name,
        description,
        versionid,
        prerequisite,
        statusid: parseInt(statusid, 10),
        author: 2
      };

      const caseRes = await axios.post(`${API_BASE}/testcase`, testCasePayload);
      const insertedCase = caseRes.data.data;
      const newTestCaseId = insertedCase.testcaseid || insertedCase.id;

      if (!newTestCaseId) {
        throw new Error('Failed to retrieve new Test Case ID from the response.');
      }

      await axios.post(`${API_BASE}/testsuite/${testsuiteid}/testcases/${newTestCaseId}`);

      navigate(`/suites/${testsuiteid}/cases`);
    } catch (err) {
      console.error("Error creating and mapping test case:", err);
      setError(err.response?.data?.error || 'Failed to create test case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => navigate(`/suites/${testsuiteid}/cases`)}
        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Test Cases
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Test Case</h1>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="testcase-name" className="block text-sm font-bold text-slate-700 mb-2">Test Case Name</label>
            <input
              id="testcase-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Confirm product checkout success"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 placeholder-slate-400"
              required
            />
          </div>

          <div>
            <label htmlFor="testcase-desc" className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              id="testcase-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ensure correct details are written to the database on checkout success..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 placeholder-slate-400 h-28"
            />
          </div>

          <div>
            <label htmlFor="testcase-prereq" className="block text-sm font-bold text-slate-700 mb-2">Prerequisites</label>
            <textarea
              id="testcase-prereq"
              value={prerequisite}
              onChange={(e) => setPrerequisite(e.target.value)}
              placeholder="e.g. Valid user session is active. Shopping cart has at least 1 item."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 placeholder-slate-400 h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="testcase-version" className="block text-sm font-bold text-slate-700 mb-2">Version</label>
              <input
                id="testcase-version"
                type="text"
                value={versionid}
                onChange={(e) => setVersionid(e.target.value)}
                placeholder="v1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label htmlFor="testcase-status" className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                id="testcase-status"
                value={statusid}
                onChange={(e) => setStatusid(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 bg-white"
              >
                <option value={1}>New</option>
                <option value={2}>In Progress</option>
                <option value={3}>Passed</option>
                <option value={4}>Failed</option>
                <option value={5}>Blocked</option>
                <option value={6}>On Hold</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(`/suites/${testsuiteid}/cases`)}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:bg-indigo-400"
            >
              <Save size={18} /> {loading ? 'Saving...' : 'Save Test Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTestCase;
