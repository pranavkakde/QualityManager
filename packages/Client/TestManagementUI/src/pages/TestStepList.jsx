import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Plus, 
  ListTodo, 
  Trash2, 
  Pencil, 
  AlertCircle, 
  X, 
  Save, 
  Sparkles,
  PlayCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

const API_BASE = '/api';

const TestStepList = () => {
  const { testcaseid } = useParams();
  const navigate = useNavigate();

  const [testcase, setTestcase] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Fields for adding
  const [addStepName, setAddStepName] = useState('');
  const [addAction, setAddAction] = useState('');
  const [addVerification, setAddVerification] = useState('');
  const [addStatusId, setAddStatusId] = useState(1);
  const [addLoading, setAddLoading] = useState(false);

  // Fields for editing
  const [editStep, setEditStep] = useState(null);
  const [editStepName, setEditStepName] = useState('');
  const [editAction, setEditAction] = useState('');
  const [editVerification, setEditVerification] = useState('');
  const [editStatusId, setEditStatusId] = useState(1);
  const [editLoading, setEditLoading] = useState(false);

  // Fields for deleting
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getStatusBadge = (statusid) => {
    switch (statusid) {
      case 1:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">New</span>;
      case 2:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Pass</span>;
      case 3:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Failed</span>;
      case 4:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Blocked</span>;
      case 5:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Complete</span>;
      case 6:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">On Hold</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">New</span>;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch testcase details
      const testcaseRes = await axios.get(`${API_BASE}/testcase/${testcaseid}`);
      const cData = Array.isArray(testcaseRes.data) ? testcaseRes.data[0] : testcaseRes.data;
      setTestcase(cData);

      // 2. Fetch steps
      try {
        const stepsRes = await axios.get(`${API_BASE}/testcase/testcasesteps/${testcaseid}/steps`);
        setSteps(Array.isArray(stepsRes.data) ? stepsRes.data : []);
      } catch (sErr) {
        // If 400 or empty, it could mean no steps exist yet, which is fine
        setSteps([]);
      }
    } catch (err) {
      console.error("Error loading test steps view data:", err);
      setError('Failed to load test steps details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [testcaseid]);

  // Create Step
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addStepName.trim()) {
      alert('Step name is required.');
      return;
    }

    try {
      setAddLoading(true);
      const payload = {
        stepname: addStepName,
        action: addAction,
        verification: addVerification,
        statusid: parseInt(addStatusId, 10)
      };

      await axios.post(`${API_BASE}/testcase/testcasesteps/${testcaseid}/steps`, payload);
      
      // Reset & close modal
      setAddStepName('');
      setAddAction('');
      setAddVerification('');
      setAddStatusId(1);
      setShowAddModal(false);
      
      // Refresh
      fetchData();
    } catch (err) {
      console.error("Failed to add test step:", err);
      alert(err.response?.data?.error || 'Failed to add test step.');
    } finally {
      setAddLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (step) => {
    setEditStep(step);
    setEditStepName(step.stepname || '');
    setEditAction(step.action || '');
    setEditVerification(step.verification || '');
    setEditStatusId(step.statusid || 1);
    setShowEditModal(true);
  };

  // Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editStepName.trim()) {
      alert('Step name cannot be empty.');
      return;
    }

    try {
      setEditLoading(true);
      const payload = {
        stepname: editStepName,
        action: editAction,
        verification: editVerification,
        statusid: parseInt(editStatusId, 10)
      };

      await axios.put(`${API_BASE}/testcase/testcasesteps/${testcaseid}/steps/${editStep.stepid}`, payload);
      
      setShowEditModal(false);
      setEditStep(null);
      
      fetchData();
    } catch (err) {
      console.error("Failed to update test step:", err);
      alert(err.response?.data?.error || 'Failed to update test step.');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Click
  const handleDeleteClick = (step) => {
    setDeleteTarget(step);
    setShowDeleteConfirm(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await axios.delete(`${API_BASE}/testcase/testcasesteps/${testcaseid}/steps/${deleteTarget.stepid}`);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error("Failed to delete test step:", err);
      alert(err.response?.data?.error || "Failed to delete test step.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Test Steps...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Parent Case Summary */}
      {testcase && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ListTodo className="text-indigo-600" size={24} />
              <h1 className="text-2xl font-extrabold text-slate-800">{testcase.name}</h1>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">{testcase.description || 'No description provided.'}</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap text-sm"
          >
            <Plus size={18} /> Add Test Step
          </button>
        </div>
      )}

      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        🛠️ Test Steps List ({steps.length})
      </h2>

      {steps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <ListTodo size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No Test Steps Added Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Document sequential step names, clear actions, and matching verifications to establish precise test cases.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
          >
            Create First Test Step
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">#</th>
                  <th className="py-4 px-6">Step Name</th>
                  <th className="py-4 px-6">Action Details</th>
                  <th className="py-4 px-6">Expected Verification</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {steps.map((step, idx) => (
                  <tr key={step.stepid} className="hover:bg-slate-50/50 transition-colors text-slate-700 text-sm">
                    <td className="py-4 px-6 text-center font-extrabold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {step.stepname}
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate leading-relaxed">
                      {step.action || '-'}
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate leading-relaxed">
                      {step.verification || '-'}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(step.statusid)}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(step)}
                          title="Edit Step"
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(step)}
                          title="Delete Step"
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden transform scale-100 transition-all duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={20} />
                <h3 className="font-extrabold text-slate-850 text-lg">Add New Test Step</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-650 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Step Name</label>
                <input
                  type="text"
                  value={addStepName}
                  onChange={(e) => setAddStepName(e.target.value)}
                  placeholder="e.g. Input credentials"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Action Details</label>
                <textarea
                  value={addAction}
                  onChange={(e) => setAddAction(e.target.value)}
                  placeholder="e.g. Type 'tester' inside email field and click 'Submit' button..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 text-sm leading-relaxed h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Expected Verification</label>
                <textarea
                  value={addVerification}
                  onChange={(e) => setAddVerification(e.target.value)}
                  placeholder="e.g. User should see a green success alert saying 'Welcome'..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 text-sm leading-relaxed h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Initial Status</label>
                <select
                  value={addStatusId}
                  onChange={(e) => setAddStatusId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-750 text-sm font-medium bg-white"
                >
                  <option value={1}>New</option>
                  <option value={2}>Pass</option>
                  <option value={3}>Failed</option>
                  <option value={4}>Blocked</option>
                  <option value={5}>Complete</option>
                  <option value={6}>On Hold</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm disabled:bg-indigo-400 flex items-center justify-center gap-1.5"
                >
                  <Save size={16} /> {addLoading ? 'Creating...' : 'Save Step'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Step Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden transform scale-100 transition-all duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Pencil className="text-indigo-600" size={20} />
                <h3 className="font-extrabold text-slate-850 text-lg">Modify Test Step</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-650 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Step Name</label>
                <input
                  type="text"
                  value={editStepName}
                  onChange={(e) => setEditStepName(e.target.value)}
                  placeholder="e.g. Input credentials"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Action Details</label>
                <textarea
                  value={editAction}
                  onChange={(e) => setEditAction(e.target.value)}
                  placeholder="e.g. Type 'tester' inside email field..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 text-sm leading-relaxed h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Expected Verification</label>
                <textarea
                  value={editVerification}
                  onChange={(e) => setEditVerification(e.target.value)}
                  placeholder="e.g. User should see a green success alert..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 text-sm leading-relaxed h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Step Status</label>
                <select
                  value={editStatusId}
                  onChange={(e) => setEditStatusId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-750 text-sm font-medium bg-white"
                >
                  <option value={1}>New</option>
                  <option value={2}>Pass</option>
                  <option value={3}>Failed</option>
                  <option value={4}>Blocked</option>
                  <option value={5}>Complete</option>
                  <option value={6}>On Hold</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm disabled:bg-indigo-400 flex items-center justify-center gap-1.5"
                >
                  <Save size={16} /> {editLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden transform scale-100 transition-all duration-300">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 text-rose-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Test Step?</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Are you absolutely sure you want to delete step <span className="font-bold text-slate-800">"{deleteTarget?.stepname}"</span>?<br />
                This action is permanent and cannot be undone.
              </p>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-sm text-sm disabled:bg-rose-400"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestStepList;
