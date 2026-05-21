import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/api';

const stepStatusMap = {
  1: 'New',
  2: 'Pass',
  3: 'Failed',
  4: 'Blocked',
  5: 'Complete',
  6: 'On Hold'
};

const TestRunList = ({ selectedRelease }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'execute'
  const [suites, setSuites] = useState([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState('');
  const [runs, setRuns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Create Mode
  const [newRunName, setNewRunName] = useState('');
  const [createCases, setCreateCases] = useState([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);
  const [createTagFilter, setCreateTagFilter] = useState('');

  // Execute Mode
  const [activeRun, setActiveRun] = useState(null);
  const [runCases, setRunCases] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [runSteps, setRunSteps] = useState([]);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/users`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("[TestRunList] Error fetching users:", err);
    }
  };

  const resolveCurrentUserId = () => {
    const currentUsername = localStorage.getItem('username') || 'admin';
    const foundUser = users.find(u => 
      (u.UserName || '').toLowerCase() === currentUsername.toLowerCase()
    );
    return foundUser ? (foundUser.UserId || foundUser.id) : 1;
  };

  useEffect(() => {
    if (selectedRelease) {
      fetchSuites();
    } else {
      setSuites([]);
      setRuns([]);
    }
  }, [selectedRelease]);

  const fetchSuites = async () => {
    try {
      console.log(`[TestRunList] Fetching suites for release ${selectedRelease}`);
      const res = await axios.get(`${API_BASE}/release/release/${selectedRelease}/testsuites`);
      console.log(`[TestRunList] Fetched suites:`, res.data);
      const suitesData = Array.isArray(res.data) ? res.data : [];
      setSuites(suitesData);
      
      // Auto-select first suite if none selected
      if (suitesData.length > 0 && !selectedSuiteId) {
        setSelectedSuiteId(suitesData[0].testsuiteid || suitesData[0].id);
      }
    } catch (err) {
      console.error("[TestRunList] Error fetching suites:", err);
    }
  };

  useEffect(() => {
    if (selectedSuiteId && viewMode === 'list') {
      fetchRuns();
    } else {
      setRuns([]);
    }
  }, [selectedSuiteId, statusFilter, viewMode]);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/testcase/testruns/suite/${selectedSuiteId}`;
      if (statusFilter) url += `?status=${statusFilter}`;
      
      const res = await axios.get(url);
      setRuns(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateMode = async () => {
    if (!selectedSuiteId) {
      alert("Please select a test suite first");
      return;
    }
    try {
      setNewRunName('');
      setSelectedCaseIds([]);
      setCreateTagFilter('');
      const res = await axios.get(`${API_BASE}/testcase/release/${selectedRelease}/testcases`);
      const suiteCases = (res.data || []).filter(c => Number(c.testsuiteid) === Number(selectedSuiteId));
      setCreateCases(suiteCases);
      setViewMode('create');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRun = async () => {
    if (!newRunName.trim()) {
      alert("Please enter a Run Name");
      return;
    }
    if (selectedCaseIds.length === 0) {
      alert("Please select at least one Test Case");
      return;
    }
    
    try {
      const activeUserId = resolveCurrentUserId();
      await axios.post(`${API_BASE}/testcase/testruns`, {
        name: newRunName,
        testsuiteid: selectedSuiteId,
        userid: activeUserId,
        testcaseids: selectedCaseIds
      });
      setViewMode('list');
      fetchRuns();
    } catch (err) {
      console.error(err);
      alert("Failed to create run: " + err.message);
    }
  };

  const filteredCreateCases = createCases.filter(c => {
    if (createTagFilter && !c.tag?.toLowerCase().includes(createTagFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleToggleCase = (id) => {
    setSelectedCaseIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredCreateCases.map(c => c.testcaseid);
    const areAllSelected = allFilteredIds.every(id => selectedCaseIds.includes(id));
    if (areAllSelected) {
      setSelectedCaseIds(selectedCaseIds.filter(id => !allFilteredIds.includes(id)));
    } else {
      const newSelected = new Set([...selectedCaseIds, ...allFilteredIds]);
      setSelectedCaseIds(Array.from(newSelected));
    }
  };

  const handleOpenExecuteMode = async (run) => {
    setActiveRun(run);
    setActiveCaseId(null);
    setRunSteps([]);
    try {
      const res = await axios.get(`${API_BASE}/testcase/testruns/${run.testrunid}/cases`);
      setRunCases(res.data || []);
      setViewMode('execute');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCaseToExecute = async (caseId) => {
    setActiveCaseId(caseId);
    try {
      const res = await axios.get(`${API_BASE}/testcase/testruns/${activeRun.testrunid}/cases/${caseId}/steps`);
      setRunSteps(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStepStatus = (stepId, statusId) => {
    setRunSteps(prev => prev.map(s => s.stepid === stepId ? { ...s, statusid: Number(statusId) } : s));
  };

  const handleSaveSteps = async () => {
    if (!activeCaseId || !activeRun) return;
    try {
      const payload = {
        steps: runSteps.map(s => ({ stepid: s.stepid, statusid: s.statusid }))
      };
      await axios.put(`${API_BASE}/testcase/testruns/${activeRun.testrunid}/cases/${activeCaseId}/steps`, payload);
      alert("Steps execution saved successfully!");
      
      const casesRes = await axios.get(`${API_BASE}/testcase/testruns/${activeRun.testrunid}/cases`);
      setRunCases(casesRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to save step statuses");
    }
  };

  if (!selectedRelease) {
    return <div className="p-8 text-slate-500">Please select a release from the top right to view Test Runs.</div>;
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {viewMode === 'list' && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Test Runs Workspace</h1>
              <p className="text-slate-500 text-sm mt-1">Manage and execute test runs for suites in the selected release.</p>
            </div>
            <button 
              onClick={handleOpenCreateMode}
              disabled={!selectedSuiteId || selectedSuiteId === 'all'}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all"
            >
              Start New Run
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              Filters & Scoping
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Test Suite Scoping</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 font-medium bg-slate-50 hover:bg-slate-100/50 transition-colors"
                  value={selectedSuiteId}
                  onChange={(e) => setSelectedSuiteId(e.target.value)}
                >
                  <option value="">📁 Select a Test Suite...</option>
                  {suites.map(s => {
                    const sId = s.testsuiteid || s.id;
                    const sName = s.name || s.testsuitename || `Suite ${sId}`;
                    return (
                      <option key={sId} value={sId}>
                        📄 {sName}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Run Status</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 font-medium bg-slate-50 hover:bg-slate-100/50 transition-colors"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading runs...</div>
            ) : runs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No test runs found.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-sm font-semibold text-slate-600">
                    <th className="p-4">Run ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Creator</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map(run => (
                    <tr key={run.testrunid} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">#{run.testrunid}</td>
                      <td className="p-4 text-slate-700 font-medium">{run.name}</td>
                      <td className="p-4 text-slate-500">{new Date(run.startdate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          run.status === 'Complete' ? 'bg-emerald-100 text-emerald-700' :
                          run.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{run.creatorname || `User ${run.userid}`}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleOpenExecuteMode(run)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded transition-colors"
                        >
                          {run.status === 'New' ? 'Start' : 'Resume'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {viewMode === 'create' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setViewMode('list')} className="text-slate-500 hover:text-slate-800 text-2xl">&larr;</button>
            <h2 className="text-xl font-bold text-slate-800">Start New Test Run</h2>
          </div>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Run Name *</label>
              <input 
                type="text" 
                value={newRunName}
                onChange={(e) => setNewRunName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Smoke Test - Sprint 24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter Cases by Tag</label>
              <input 
                type="text" 
                value={createTagFilter}
                onChange={(e) => setCreateTagFilter(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. core, auth"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Select Test Cases for this Run</h3>
              <button 
                onClick={handleSelectAllFiltered}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Select / Deselect All Filtered
              </button>
            </div>
            
            <div className="border border-slate-200 rounded-lg max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr className="text-left text-sm font-semibold text-slate-600">
                    <th className="p-3 w-12"></th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCreateCases.map(tc => (
                    <tr key={tc.testcaseid} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => handleToggleCase(tc.testcaseid)}>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedCaseIds.includes(tc.testcaseid)}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-3 text-slate-600">#{tc.testcaseid}</td>
                      <td className="p-3 font-medium text-slate-800">{tc.name}</td>
                      <td className="p-3">
                        {tc.tag ? <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{tc.tag}</span> : '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredCreateCases.length === 0 && (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-500">No test cases match filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {selectedCaseIds.length} case(s) selected out of {filteredCreateCases.length} shown.
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              onClick={handleCreateRun}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
            >
              Save & Start Run
            </button>
          </div>
        </div>
      )}

      {viewMode === 'execute' && activeRun && (
        <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-4">
              <button onClick={() => setViewMode('list')} className="text-slate-500 hover:text-slate-800 font-bold">&larr; Back</button>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{activeRun.name}</h2>
                <div className="text-xs text-slate-500">Run ID: #{activeRun.testrunid} | Overall Status: <span className="font-semibold text-slate-700">{activeRun.status}</span></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar: Test Cases */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col bg-white">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 text-sm">
                Test Cases ({runCases.length})
              </div>
              <div className="flex-1 overflow-y-auto">
                {runCases.map(c => (
                  <div 
                    key={c.testcaseid}
                    onClick={() => handleSelectCaseToExecute(c.testcaseid)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${activeCaseId === c.testcaseid ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-slate-800 text-sm break-all pr-2">{c.name}</div>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${
                          c.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' :
                          c.status === 'Failed' ? 'bg-red-100 text-red-700' :
                          c.status === 'Blocked' ? 'bg-rose-100 text-rose-700' :
                          c.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">ID: #{c.testcaseid} {c.tag && `| Tag: ${c.tag}`}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Area: Execution Steps */}
            <div className="w-2/3 flex flex-col bg-slate-50/50">
              {activeCaseId ? (
                <>
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                    <div>
                      <h3 className="font-bold text-slate-800">Execution Steps</h3>
                      <div className="text-xs text-slate-500">Select status for each step and save to auto-update case status.</div>
                    </div>
                    <button 
                      onClick={handleSaveSteps}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors"
                    >
                      Save Steps &amp; Update Status
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    {runSteps.length === 0 ? (
                      <div className="text-center text-slate-500 mt-10">No steps defined for this test case.</div>
                    ) : (
                      <div className="space-y-4">
                        {runSteps.map((step, idx) => (
                          <div key={step.stepid} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800 text-sm mb-1">{step.stepname || `Step ${step.stepid}`}</h4>
                              <div className="text-sm text-slate-600 mb-2"><strong>Action:</strong> {step.action}</div>
                              <div className="text-sm text-slate-600"><strong>Verification:</strong> {step.verification}</div>
                            </div>
                            <div className="md:w-48 flex-shrink-0">
                              <select 
                                value={step.statusid}
                                onChange={(e) => handleUpdateStepStatus(step.stepid, e.target.value)}
                                className={`w-full p-2 text-sm font-medium rounded border focus:outline-none focus:ring-2 ${
                                  step.statusid === 2 || step.statusid === 5 ? 'border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-500' :
                                  step.statusid === 3 ? 'border-red-300 bg-red-50 text-red-800 focus:ring-red-500' :
                                  step.statusid === 4 ? 'border-rose-300 bg-rose-50 text-rose-800 focus:ring-rose-500' :
                                  step.statusid === 6 ? 'border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-500' :
                                  'border-slate-300 bg-slate-50 text-slate-800 focus:ring-slate-500'
                                }`}
                              >
                                {Object.entries(stepStatusMap).map(([id, label]) => (
                                  <option key={id} value={id}>{label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  Select a test case from the sidebar to begin execution.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunList;
