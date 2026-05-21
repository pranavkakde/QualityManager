import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, AlertCircle, Sparkles, Tag, UserCheck, Activity } from 'lucide-react';

const API_BASE = '/api';

const EditTestCase = () => {
  const { testcaseid } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prerequisite, setPrerequisite] = useState('');
  const [versionid, setVersionid] = useState('');
  const [statusid, setStatusid] = useState(1);
  const [authorId, setAuthorId] = useState(2); // default
  const [tag, setTag] = useState('');
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 1. Fetch case details
        const caseRes = await axios.get(`${API_BASE}/testcase/${testcaseid}`);
        const cData = Array.isArray(caseRes.data) ? caseRes.data[0] : caseRes.data;
        
        if (cData) {
          setName(cData.name || '');
          setDescription(cData.description || '');
          setPrerequisite(cData.prerequisite || '');
          setVersionid(cData.versionid || 'v1');
          setStatusid(cData.statusid || 1);
          setAuthorId(cData.author || 2);
          setTag(cData.tag || '');
        } else {
          throw new Error('Test case details not found.');
        }

        // 2. Fetch users list
        try {
          const usersRes = await axios.get(`${API_BASE}/user/users`);
          setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        } catch (uErr) {
          console.error("Failed to load users list:", uErr);
        }
      } catch (err) {
        console.error("Error loading test case to edit:", err);
        setError(err.response?.data?.error || 'Failed to load test case details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testcaseid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Test Case name is required.');
      return;
    }

    try {
      setSaveLoading(true);
      setError('');

      const updatePayload = {
        name,
        description,
        prerequisite,
        statusid: parseInt(statusid, 10),
        author: parseInt(authorId, 10),
        tag
      };

      await axios.put(`${API_BASE}/testcase/${testcaseid}`, updatePayload);
      
      // Go back to the global list or suite list
      navigate(-1);
    } catch (err) {
      console.error("Error updating test case:", err);
      setError(err.response?.data?.error || 'Failed to update test case. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const getNextVersionPreview = (curr) => {
    if (!curr) return 'v2';
    const vMatch = curr.match(/^v(\d+)$/i);
    if (vMatch) {
      return `v${parseInt(vMatch[1], 10) + 1}`;
    }
    const numMatch = curr.match(/^(\d+)$/);
    if (numMatch) {
      return `${parseInt(numMatch[1], 10) + 1}`;
    }
    return `${curr}_v2`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium">Loading Test Case Details...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-indigo-600 animate-pulse" size={24} />
          <h1 className="text-2xl font-extrabold text-slate-800">Edit Test Case</h1>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Modifying this test case will automatically increment its version to keep historical tracking integrity.
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Case Name */}
          <div>
            <label htmlFor="testcase-name" className="block text-sm font-bold text-slate-700 mb-2">Test Case Name</label>
            <input
              id="testcase-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Confirm product checkout success"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 font-medium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="testcase-desc" className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              id="testcase-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ensure correct details are written to the database on checkout success..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 h-28 leading-relaxed"
            />
          </div>

          {/* Prerequisites */}
          <div>
            <label htmlFor="testcase-prereq" className="block text-sm font-bold text-slate-700 mb-2">Prerequisites</label>
            <textarea
              id="testcase-prereq"
              value={prerequisite}
              onChange={(e) => setPrerequisite(e.target.value)}
              placeholder="e.g. Valid user session is active. Shopping cart has at least 1 item."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 h-20 leading-relaxed"
            />
          </div>

          {/* Tag */}
          <div>
            <label htmlFor="testcase-tag" className="block text-sm font-bold text-slate-700 mb-2">Tag</label>
            <input
              id="testcase-tag"
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Smoke, Regression, Billing"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Grid for Version, Status, Author */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Automatic Version Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Versioning System</label>
              <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-sm">
                <span className="text-slate-600 font-bold flex items-center gap-1">
                  <Tag size={14} className="text-slate-400" /> {versionid}
                </span>
                <span className="text-xs text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  → {getNextVersionPreview(versionid)}
                </span>
              </div>
            </div>

            {/* TestCase Status */}
            <div>
              <label htmlFor="testcase-status" className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Status</label>
              <select
                id="testcase-status"
                value={statusid}
                onChange={(e) => setStatusid(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm font-medium bg-white"
              >
                <option value={1}>New</option>
                <option value={2}>In Progress</option>
                <option value={3}>Passed</option>
                <option value={4}>Failed</option>
                <option value={5}>Blocked</option>
                <option value={6}>On Hold</option>
                <option value={7}>In Review</option>
                <option value={8}>Reviewed</option>
              </select>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="testcase-author" className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Author</label>
              <select
                id="testcase-author"
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm font-medium bg-white"
              >
                {users.map(u => (
                  <option key={u.UserId || u.id} value={u.UserId || u.id}>
                    👤 {u.UserName || u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:bg-indigo-400 text-sm"
            >
              <Save size={18} /> {saveLoading ? 'Updating Version...' : 'Save & Increment Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTestCase;
