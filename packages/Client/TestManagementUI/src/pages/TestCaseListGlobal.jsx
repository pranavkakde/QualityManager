import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Pencil, 
  History, 
  ListTodo, 
  Tag, 
  User, 
  FolderGit2, 
  AlertCircle,
  X,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

const API_BASE = '/api';

const TestCaseListGlobal = ({ selectedRelease }) => {
  const [suites, setSuites] = useState([]);
  const [cases, setCases] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedSuiteId, setSelectedSuiteId] = useState('all');
  const [filterName, setFilterName] = useState('');
  const [filterDesc, setFilterDesc] = useState('');
  const [filterVersion, setFilterVersion] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('');
  
  // Delete confirm modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  const getStatusBadge = (statusid) => {
    switch (statusid) {
      case 1:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">New</span>;
      case 2:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">In Progress</span>;
      case 3:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Passed</span>;
      case 4:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Failed</span>;
      case 5:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Blocked</span>;
      case 6:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">On Hold</span>;
      case 7:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">In Review</span>;
      case 8:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">Reviewed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">New</span>;
    }
  };

  const fetchData = async () => {
    if (!selectedRelease) return;
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch suites
      const suitesRes = await axios.get(`${API_BASE}/release/release/${selectedRelease}/testsuites`);
      const fetchedSuites = Array.isArray(suitesRes.data) ? suitesRes.data : [];
      setSuites(fetchedSuites);

      // 2. Fetch cases
      const casesRes = await axios.get(`${API_BASE}/testcase/release/${selectedRelease}/testcases`);
      setCases(Array.isArray(casesRes.data) ? casesRes.data : []);

      // 3. Fetch users map
      try {
        const usersRes = await axios.get(`${API_BASE}/user/users`);
        const usersList = Array.isArray(usersRes.data) ? usersRes.data : [];
        const mapping = {};
        usersList.forEach(u => {
          const id = u.UserId || u.id;
          const name = u.UserName || u.name;
          if (id && name) {
            mapping[id] = name;
          }
        });
        setUserMap(mapping);
      } catch (uErr) {
        console.error("Error fetching users list:", uErr);
      }
    } catch (err) {
      console.error("Error fetching global test cases data:", err);
      setError('Failed to load test cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRelease]);

  // Handle Delete Confirmation
  const handleDeleteClick = (testcase) => {
    setDeleteTarget(testcase);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await axios.delete(`${API_BASE}/testcase/${deleteTarget.testcaseid}`);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      // Refresh list
      fetchData();
    } catch (err) {
      console.error("Failed to delete testcase:", err);
      alert(err.response?.data?.error || "Failed to delete test case. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtering Logic
  const filteredCases = cases.filter(c => {
    // Suite filter
    if (selectedSuiteId !== 'all' && Number(c.testsuiteid) !== Number(selectedSuiteId)) {
      return false;
    }
    // Name filter
    if (filterName && !c.name?.toLowerCase().includes(filterName.toLowerCase())) {
      return false;
    }
    // Description filter
    if (filterDesc && !c.description?.toLowerCase().includes(filterDesc.toLowerCase())) {
      return false;
    }
    // Version filter
    if (filterVersion && !c.versionid?.toLowerCase().includes(filterVersion.toLowerCase())) {
      return false;
    }
    // Status filter
    if (filterStatus !== 'all' && Number(c.statusid) !== Number(filterStatus)) {
      return false;
    }
    // Author filter
    if (filterAuthor) {
      const authorName = userMap[c.author] || `User ${c.author}`;
      if (!authorName.toLowerCase().includes(filterAuthor.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const activeSuiteName = selectedSuiteId === 'all' 
    ? 'All Test Suites' 
    : suites.find(s => Number(s.testsuiteid || s.id) === Number(selectedSuiteId))?.name || 'Selected Suite';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Test Cases Workspace...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-bold text-slate-800">Test Cases Workspace</h1>
          </div>
          <p className="text-slate-500 text-sm">
            View, search, edit, version, and manage test steps across all suites in the selected release.
          </p>
        </div>
        
        {/* Dynamic Add Button - visible only when a suite is chosen */}
        {selectedSuiteId !== 'all' && (
          <button
            onClick={() => navigate(`/suites/${selectedSuiteId}/cases/add`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> Add Test Case
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Dynamic Filter Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Search size={16} className="text-slate-400" /> Filters & Workspace Scoping
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Suite Scoper */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Test Suite Scoping</label>
            <select
              value={selectedSuiteId}
              onChange={(e) => setSelectedSuiteId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 font-medium bg-slate-50 hover:bg-slate-100/50 transition-colors"
            >
              <option value="all">📁 All Suites (Global View)</option>
              {suites.map(s => {
                const sId = s.testsuiteid || s.id;
                return (
                  <option key={sId} value={sId}>
                    📄 {s.name || s.testsuitename}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Name Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Test Case Name</label>
            <input
              type="text"
              placeholder="Filter by name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm"
            />
          </div>

          {/* Description Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Description</label>
            <input
              type="text"
              placeholder="Filter by description..."
              value={filterDesc}
              onChange={(e) => setFilterDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm"
            />
          </div>

          {/* Version Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Version</label>
            <input
              type="text"
              placeholder="e.g. v1"
              value={filterVersion}
              onChange={(e) => setFilterVersion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="1">New</option>
              <option value="2">In Progress</option>
              <option value="3">Passed</option>
              <option value="4">Failed</option>
              <option value="5">Blocked</option>
              <option value="6">On Hold</option>
              <option value="7">In Review</option>
              <option value="8">Reviewed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
          {/* Author filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Author</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={14} />
              </span>
              <input
                type="text"
                placeholder="Search author..."
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 text-sm"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="md:col-span-2 flex items-end justify-end gap-3 pb-1">
            <span className="text-xs font-bold text-slate-500 px-3 py-2 rounded-lg bg-slate-100">
              Total Test Cases: <span className="text-slate-800 font-extrabold">{cases.length}</span>
            </span>
            <span className="text-xs font-bold text-slate-500 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700">
              Matching Filters: <span className="font-extrabold">{filteredCases.length}</span>
            </span>
            {(filterName || filterDesc || filterVersion || filterStatus !== 'all' || filterAuthor || selectedSuiteId !== 'all') && (
              <button
                onClick={() => {
                  setSelectedSuiteId('all');
                  setFilterName('');
                  setFilterDesc('');
                  setFilterVersion('');
                  setFilterStatus('all');
                  setFilterAuthor('');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 transition-all flex items-center gap-1"
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Test Cases Table */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <FileText size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No Test Cases Match Criteria</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Try adjusting your filters, selecting a different suite, or check another release.
          </p>
          {selectedSuiteId !== 'all' && (
            <button
              onClick={() => navigate(`/suites/${selectedSuiteId}/cases/add`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              Add New Test Case to Suite
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Suite</th>
                  <th className="py-4 px-6">Version</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((testcase) => {
                  const suiteName = suites.find(s => Number(s.testsuiteid || s.id) === Number(testcase.testsuiteid))?.name || 'Defect/Other Suite';
                  return (
                    <tr key={testcase.testcaseid} className="hover:bg-slate-50/50 transition-colors text-slate-700 text-sm">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 block">{testcase.name}</span>
                        {testcase.prerequisite && (
                          <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            Prereq: {testcase.prerequisite}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate" title={testcase.description}>
                        {testcase.description || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          <FolderGit2 size={12} className="text-slate-400" /> {suiteName}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                          <Tag size={12} /> {testcase.versionid || 'v1'}
                        </span>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(testcase.statusid)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-slate-400" />
                          <span className="font-semibold text-slate-600 text-xs">
                            {userMap[testcase.author] || `User ${testcase.author}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Steps */}
                          <button
                            onClick={() => navigate(`/testcases/${testcase.testcaseid}/steps`)}
                            title="Manage Steps"
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <ListTodo size={16} />
                          </button>
                          
                          {/* Versions */}
                          <button
                            onClick={() => navigate(`/testcases/${testcase.testcaseid}/versions`)}
                            title="View Version History"
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <History size={16} />
                          </button>
                          
                          {/* Edit */}
                          <button
                            onClick={() => navigate(`/testcases/${testcase.testcaseid}/edit`)}
                            title="Edit Test Case"
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteClick(testcase)}
                            title="Delete Test Case"
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 size={16} />
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden transform scale-100 transition-all duration-300">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 text-rose-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Test Case?</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Are you absolutely sure you want to delete <span className="font-bold text-slate-800">"{deleteTarget?.name}"</span>?<br />
                This action is permanent and will cascade-delete all of its test steps, run histories, defect mappings, and version histories!
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

export default TestCaseListGlobal;
