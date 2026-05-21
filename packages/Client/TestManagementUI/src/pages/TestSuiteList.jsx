import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  TestTube, 
  Pencil, 
  Trash2, 
  Bug, 
  FileText, 
  Plus, 
  X, 
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const API_BASE = '/api';

const TestSuiteList = ({ selectedRelease }) => {
  const [suites, setSuites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals and operations state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSuite, setEditSuite] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatusId, setEditStatusId] = useState(1);
  const [editLoading, setEditLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuiteObj, setDeleteSuiteObj] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  const fetchSuites = async () => {
    if (!selectedRelease) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/release/release/${selectedRelease}/testsuites`);
      setSuites(Array.isArray(res.data) ? res.data : []);
      setErrorMsg('');
    } catch (err) {
      console.error("Error fetching suites:", err);
      setErrorMsg('Failed to load test suites. Please try again.');
      setSuites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuites();
  }, [selectedRelease]);

  // Handle Edit Open
  const handleOpenEdit = (suite) => {
    setEditSuite(suite);
    setEditName(suite.testsuitename || suite.name || '');
    setEditDescription(suite.description || '');
    setEditStatusId(suite.statusid || 1);
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Suite name cannot be empty.');
      return;
    }
    setEditLoading(true);
    try {
      await axios.put(`${API_BASE}/testsuite/testsuite/${editSuite.testsuiteid || editSuite.id}`, {
        name: editName,
        description: editDescription,
        statusid: Number(editStatusId),
        releaseid: Number(editSuite.releaseid || selectedRelease)
      });
      setSuccessMsg('Test suite updated successfully!');
      setShowEditModal(false);
      fetchSuites();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Error updating suite:", err);
      alert('Failed to update test suite: ' + (err.response?.data?.error || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Open
  const handleOpenDelete = (suite) => {
    setDeleteSuiteObj(suite);
    setShowDeleteConfirm(true);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      const suiteId = deleteSuiteObj.testsuiteid || deleteSuiteObj.id;
      await axios.delete(`${API_BASE}/testsuite/testsuite/${suiteId}`);
      setSuccessMsg('Test suite deleted successfully!');
      setShowDeleteConfirm(false);
      fetchSuites();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Error deleting suite:", err);
      alert('Failed to delete test suite: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (statusid) => {
    switch (statusid) {
      case 1:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">Created</span>;
      case 2:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">In Progress</span>;
      case 3:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 shadow-sm">Created</span>;
    }
  };

  return (
    <div className="p-8">
      {/* Messages */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <AlertCircle className="text-rose-500" size={20} />
          <span className="font-medium text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Test Suites</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and organize your test suites, executable test cases, and logged defects.</p>
        </div>
        <button
          onClick={() => navigate('/suites/add')}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow flex items-center gap-2 text-sm"
        >
          <Plus size={18} />
          Add Suite
        </button>
      </div>

      {/* Table / Empty State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : suites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
            <TestTube className="text-indigo-600" size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No Test Suites Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">Create test suites to logically group your test cases and execution runs for this release.</p>
          <button
            onClick={() => navigate('/suites/add')}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow"
          >
            Create First Suite
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm font-bold select-none">
                  <th className="py-4.5 px-6 font-semibold">ID</th>
                  <th className="py-4.5 px-6 font-semibold">Suite Name</th>
                  <th className="py-4.5 px-6 font-semibold">Description</th>
                  <th className="py-4.5 px-6 font-semibold">Status</th>
                  <th className="py-4.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suites.map(suite => {
                  const suiteId = suite.testsuiteid || suite.id;
                  const suiteName = suite.testsuitename || suite.name;
                  return (
                    <tr key={suiteId} className="hover:bg-slate-50/60 transition-colors text-slate-700 text-sm align-middle">
                      <td className="py-4.5 px-6 font-mono text-slate-400 font-medium text-xs">#{suiteId}</td>
                      <td className="py-4.5 px-6 font-bold text-slate-800">{suiteName}</td>
                      <td className="py-4.5 px-6 max-w-md truncate text-slate-500">{suite.description || '-'}</td>
                      <td className="py-4.5 px-6">{getStatusBadge(suite.statusid)}</td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => navigate(`/suites/${suiteId}/cases`)}
                            title="View Test Cases"
                            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 transition-colors flex items-center justify-center shadow-sm"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            onClick={() => navigate('/defects', { state: { testsuiteid: suiteId } })}
                            title="View Linked Defects"
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 transition-colors flex items-center justify-center shadow-sm"
                          >
                            <Bug size={15} />
                          </button>

                          <span className="w-px h-5 bg-slate-200 mx-1"></span>

                          {/* Operations */}
                          <button
                            onClick={() => handleOpenEdit(suite)}
                            title="Edit Suite"
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(suite)}
                            title="Delete Suite"
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Pencil size={18} className="text-indigo-600" />
                Edit Test Suite
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Suite Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. User Authentication Suite"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe the scope of this test suite..."
                  rows="3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={editStatusId}
                  onChange={(e) => setEditStatusId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all text-sm"
                >
                  <option value={1}>Created</option>
                  <option value={2}>In Progress</option>
                  <option value={3}>Completed</option>
                </select>
              </div>

              <div className="flex gap-3.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <AlertTriangle className="text-rose-600" size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Delete Test Suite?</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-700">"{deleteSuiteObj?.testsuitename || deleteSuiteObj?.name}"</span>? 
                This action is permanent and cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSuiteList;
