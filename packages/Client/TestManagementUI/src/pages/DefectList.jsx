import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, 
  Trash2, 
  Plus, 
  X, 
  User, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Eye,
  Pencil,
  Download,
  Search,
  Filter
} from 'lucide-react';


const API_BASE = '/api';

const DefectList = ({ selectedRelease }) => {
  const [defects, setDefects] = useState([]);
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reference tables states
  const [defectStatuses, setDefectStatuses] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // stores defect object to delete
  const [selectedDefect, setSelectedDefect] = useState(null); // stores defect object for detail view
  const [selectedDefectTestCases, setSelectedDefectTestCases] = useState([]);

  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [defectStatusId, setDefectStatusId] = useState('1'); // Default to '1' (New)

  // Edit form state
  const [editDefectId, setEditDefectId] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editDefectStatusId, setEditDefectStatusId] = useState('1');

  // Test Suite & Test Case mappings states
  const [testSuites, setTestSuites] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [activeTestSuiteId, setActiveTestSuiteId] = useState('');
  const [activeTestCaseId, setActiveTestCaseId] = useState('');
  const [linkedTestCases, setLinkedTestCases] = useState([]);

  // Advanced search and filters states
  const [filterTestSuite, setFilterTestSuite] = useState('');
  const [filterTestCase, setFilterTestCase] = useState('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearchText, setFilterSearchText] = useState('');
  const [filterTestCasesList, setFilterTestCasesList] = useState([]);


  // Fetch defects and users
  const fetchData = async () => {
    if (!selectedRelease) return;
    try {
      setLoading(true);
      // Fetch defects
      const defectsRes = await axios.get(`${API_BASE}/defect/defects?releaseid=${selectedRelease}`);
      const defectsList = Array.isArray(defectsRes.data) ? defectsRes.data : [];

      // Fetch users
      const usersRes = await axios.get(`${API_BASE}/user/users`);
      const usersList = Array.isArray(usersRes.data) ? usersRes.data : [];
      setUsers(usersList);

      const mapping = {};
      usersList.forEach(u => {
        const id = u.UserId || u.id;
        const name = u.UserName || u.name;
        if (id && name) {
          mapping[id] = name;
        }
      });
      setUserMap(mapping);

      // Fetch defect statuses
      try {
        const statusesRes = await axios.get(`${API_BASE}/defect/statuses`);
        const statusesList = Array.isArray(statusesRes.data) ? statusesRes.data : [];
        setDefectStatuses(statusesList);
        const sMap = {};
        statusesList.forEach(s => {
          sMap[s.defectstatusid] = s.defectstatus;
        });
        setStatusMap(sMap);
      } catch (statusesErr) {
        console.error("Error fetching defect statuses:", statusesErr);
      }

      // Fetch all mappings from GET /api/defect/defect-testcases/all
      let mappings = [];
      try {
        const mappingsRes = await axios.get(`${API_BASE}/defect/defect-testcases/all`);
        mappings = Array.isArray(mappingsRes.data) ? mappingsRes.data : [];
      } catch (mappingsErr) {
        console.error("Error fetching defect mappings in bulk:", mappingsErr);
      }

      // Filter mappings for defects in this release
      const releaseDefectIds = defectsList.map(d => Number(d.defectid || d.id));
      const relevantMappings = mappings.filter(m => releaseDefectIds.includes(Number(m.defectid)));

      // Extract unique test case IDs
      const uniqueCaseIds = [...new Set(relevantMappings.map(m => m.testcaseid).filter(Boolean))];

      // Resolve test case names in one batch
      let casesData = [];
      if (uniqueCaseIds.length > 0) {
        try {
          const res = await axios.post(`${API_BASE}/testcase/filter`, { testcases: uniqueCaseIds });
          casesData = Array.isArray(res.data) ? res.data : [];
        } catch (err) {
          console.error("Error batch resolving test case names:", err);
        }
      }

      // Build case names lookup map
      const caseNameMap = {};
      casesData.forEach(c => {
        caseNameMap[c.testcaseid || c.id] = c.name;
      });

      // Fetch test suites for selected release
      let suitesList = [];
      try {
        const suitesRes = await axios.get(`${API_BASE}/release/release/${selectedRelease}/testsuites`);
        suitesList = Array.isArray(suitesRes.data) ? suitesRes.data : [];
        setTestSuites(suitesList);
      } catch (suitesErr) {
        console.error("Error fetching release test suites:", suitesErr);
      }

      // Associate suites and cases directly to each defect
      const mappedDefects = defectsList.map(defect => {
        const defectId = Number(defect.defectid || defect.id);
        const defectMappings = relevantMappings.filter(m => Number(m.defectid) === defectId);

        const linkedSuites = [];
        const linkedCases = [];

        defectMappings.forEach(m => {
          const suite = suitesList.find(s => Number(s.testsuiteid || s.id) === Number(m.testsuiteid));
          const suiteName = suite ? (suite.testsuitename || suite.name) : `Suite (ID: ${m.testsuiteid})`;
          const caseName = caseNameMap[m.testcaseid] || `Case (ID: ${m.testcaseid})`;

          if (!linkedSuites.some(s => s.id === Number(m.testsuiteid))) {
            linkedSuites.push({ id: Number(m.testsuiteid), name: suiteName });
          }
          linkedCases.push({ id: Number(m.testcaseid), name: caseName, suiteId: Number(m.testsuiteid) });
        });

        return {
          ...defect,
          linkedSuites,
          linkedCases
        };
      });

      setDefects(mappedDefects);
      setError('');

    } catch (err) {
      console.error("Error fetching defect tracker data:", err);
      setError('Failed to load defects list. Please make sure the service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRelease]);

  // Clean success/error messages after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Resolve current user to their UserId
  const resolveCurrentUserId = () => {
    const currentUsername = localStorage.getItem('username') || 'admin';
    const foundUser = users.find(u => 
      (u.UserName || '').toLowerCase() === currentUsername.toLowerCase()
    );
    return foundUser ? (foundUser.UserId || foundUser.id) : 1;
  };

  // Resolve test case names from active test case IDs
  const resolveTestCasesWithNames = async (mappings) => {
    if (!mappings || mappings.length === 0) return [];
    
    // Extract all test case IDs
    const caseIds = mappings.map(m => m.testcaseid).filter(Boolean);
    
    let casesData = [];
    if (caseIds.length > 0) {
      try {
        const res = await axios.post(`${API_BASE}/testcase/filter`, { testcases: caseIds });
        casesData = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Error resolving test case names:", err);
      }
    }
    
    // Build lookup maps
    const caseMap = {};
    casesData.forEach(c => {
      caseMap[c.testcaseid || c.id] = c.name;
    });
    
    return mappings.map(m => {
      const suite = testSuites.find(s => Number(s.testsuiteid || s.id) === Number(m.testsuiteid));
      return {
        testsuiteid: m.testsuiteid,
        testcaseid: m.testcaseid,
        suiteName: suite ? (suite.testsuitename || suite.name) : `Suite (ID: ${m.testsuiteid})`,
        caseName: caseMap[m.testcaseid] || `Case (ID: ${m.testcaseid})`
      };
    });
  };

  // Fetch test cases when a test suite is selected in mapping form
  const handleSuiteChange = async (suiteId) => {
    setActiveTestSuiteId(suiteId);
    setActiveTestCaseId('');
    if (!suiteId) {
      setTestCases([]);
      return;
    }
    try {
      const casesRes = await axios.get(`${API_BASE}/testsuite/testsuite/${suiteId}/testcases`);
      setTestCases(Array.isArray(casesRes.data) ? casesRes.data : []);
    } catch (err) {
      console.error("Error fetching test cases:", err);
      setTestCases([]);
    }
  };

  // Fetch test cases when a test suite is selected in the advanced filters
  const handleFilterSuiteChange = async (suiteId) => {
    setFilterTestSuite(suiteId);
    setFilterTestCase('');
    if (!suiteId) {
      setFilterTestCasesList([]);
      return;
    }
    try {
      const casesRes = await axios.get(`${API_BASE}/testsuite/testsuite/${suiteId}/testcases`);
      setFilterTestCasesList(Array.isArray(casesRes.data) ? casesRes.data : []);
    } catch (err) {
      console.error("Error fetching filter test cases:", err);
      setFilterTestCasesList([]);
    }
  };

  // Dynamic filter reset
  const handleClearFilters = () => {
    setFilterTestSuite('');
    setFilterTestCase('');
    setFilterAssignedTo('');
    setFilterStatus('');
    setFilterSearchText('');
    setFilterTestCasesList([]);
  };

  // Compute filtered defects list dynamically client-side
  const filteredDefects = defects.filter(defect => {
    // 1. Subject / Description search (free text)
    if (filterSearchText.trim()) {
      const search = filterSearchText.toLowerCase();
      const subjectMatch = (defect.subject || '').toLowerCase().includes(search);
      const descMatch = (defect.description || '').toLowerCase().includes(search);
      if (!subjectMatch && !descMatch) return false;
    }

    // 2. Assigned To filter
    if (filterAssignedTo && Number(defect.assignedto) !== Number(filterAssignedTo)) {
      return false;
    }

    // 3. Status filter
    if (filterStatus && Number(defect.defectstatusid) !== Number(filterStatus)) {
      return false;
    }

    // 4. Test Suite filter
    if (filterTestSuite && !defect.linkedSuites?.some(s => s.id === Number(filterTestSuite))) {
      return false;
    }

    // 5. Test Case filter
    if (filterTestCase && !defect.linkedCases?.some(c => c.id === Number(filterTestCase))) {
      return false;
    }

    return true;
  });

  // Dynamic excel / csv download
  const handleDownloadExcel = () => {
    if (filteredDefects.length === 0) {
      alert("No defects match your current filters to download.");
      return;
    }

    // Prepare headers
    const headers = [
      "Defect ID",
      "Subject",
      "Description",
      "Assigned To",
      "Created By",
      "Created Date",
      "Status",
      "Release ID",
      "Linked Test Suites",
      "Linked Test Cases"
    ];

    // Build row data
    const rows = filteredDefects.map(defect => {
      const suiteNames = (defect.linkedSuites || []).map(s => s.name).join("; ");
      const caseNames = (defect.linkedCases || []).map(c => c.name).join("; ");
      const statusText = statusMap[defect.defectstatusid] || "New";
      const assignedName = userMap[defect.assignedto] || `Developer (ID: ${defect.assignedto})`;
      const creatorName = userMap[defect.createdby] || `User (ID: ${defect.createdby})`;

      return [
        `#${defect.defectid || defect.id}`,
        defect.subject || "",
        defect.description || "",
        assignedName,
        creatorName,
        formatDate(defect.createddate),
        statusText,
        defect.releaseid || "",
        suiteNames,
        caseNames
      ];
    });

    // Helper to escape values in standard CSV fashion
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    // Combine headers and rows
    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map(row => row.map(escapeCsv).join(","))
    ].join("\n");

    // Create Blob and trigger browser download with UTF-8 BOM so Excel decodes it properly
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Defects_Release_${selectedRelease}_Export.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Append a test case mapping locally
  const handleLinkTestCase = () => {
    if (!activeTestSuiteId || !activeTestCaseId) return;

    // Check if already linked
    const alreadyLinked = linkedTestCases.some(
      tc => Number(tc.testsuiteid) === Number(activeTestSuiteId) && Number(tc.testcaseid) === Number(activeTestCaseId)
    );
    if (alreadyLinked) {
      alert("This test case is already linked to this defect.");
      return;
    }

    const selectedSuite = testSuites.find(s => Number(s.testsuiteid || s.id) === Number(activeTestSuiteId));
    const selectedCase = testCases.find(tc => Number(tc.testcaseid) === Number(activeTestCaseId));

    if (!selectedSuite || !selectedCase) return;

    const newLink = {
      testsuiteid: Number(activeTestSuiteId),
      testcaseid: Number(activeTestCaseId),
      suiteName: selectedSuite.testsuitename || selectedSuite.name || `Suite (ID: ${activeTestSuiteId})`,
      caseName: selectedCase.name || `Case (ID: ${activeTestCaseId})`
    };

    setLinkedTestCases([...linkedTestCases, newLink]);
    
    // Clear selections
    setActiveTestSuiteId('');
    setActiveTestCaseId('');
    setTestCases([]);
  };

  // Remove a local test case mapping
  const handleUnlinkTestCase = (indexToUnlink) => {
    setLinkedTestCases(linkedTestCases.filter((_, idx) => idx !== indexToUnlink));
  };

  // Open Edit Defect Modal and fetch mappings
  const handleOpenEditModal = async (defect) => {
    const defectId = defect.defectid || defect.id;
    setEditDefectId(defectId);
    setEditSubject(defect.subject || '');
    setEditDescription(defect.description || '');
    setEditAssignedTo(defect.assignedto || '');
    setEditDefectStatusId(String(defect.defectstatusid || '1'));
    
    // Clear sub-form selections
    setActiveTestSuiteId('');
    setActiveTestCaseId('');
    setTestCases([]);
    setLinkedTestCases([]);
    
    setShowEditModal(true);

    try {
      const mappingsRes = await axios.get(`${API_BASE}/defect/defect/${defectId}/testcases`);
      const resolvedMappings = await resolveTestCasesWithNames(mappingsRes.data);
      setLinkedTestCases(resolvedMappings);
    } catch (err) {
      console.error("Error loading linked test cases for edit:", err);
    }
  };

  // Fetch test cases for detail view
  useEffect(() => {
    const fetchSelectedDefectTestCases = async (defectid) => {
      try {
        const res = await axios.get(`${API_BASE}/defect/defect/${defectid}/testcases`);
        const resolved = await resolveTestCasesWithNames(res.data);
        setSelectedDefectTestCases(resolved);
      } catch (err) {
        console.error("Error fetching defect test cases for details:", err);
        setSelectedDefectTestCases([]);
      }
    };

    if (selectedDefect) {
      fetchSelectedDefectTestCases(selectedDefect.defectid || selectedDefect.id);
    } else {
      setSelectedDefectTestCases([]);
    }
  }, [selectedDefect]);

  // Report new defect submission
  const handleReportDefect = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !assignedTo) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const currentUserId = resolveCurrentUserId();
      const payload = {
        subject: subject.trim(),
        description: description.trim(),
        assignedto: Number(assignedTo),
        createdby: Number(currentUserId),
        createddate: new Date().toISOString(),
        defectstatusid: Number(defectStatusId),
        closedby: null,
        releaseid: Number(selectedRelease),
        testcases: linkedTestCases.map(tc => ({
          testsuiteid: tc.testsuiteid,
          testcaseid: tc.testcaseid
        }))
      };

      await axios.post(`${API_BASE}/defect/defect`, payload);
      setSuccessMsg('Defect reported successfully!');
      setShowAddModal(false);
      
      // Reset form
      setSubject('');
      setDescription('');
      setAssignedTo('');
      setDefectStatusId('1');
      setLinkedTestCases([]);
      
      // Refresh list
      fetchData();
    } catch (err) {
      console.error("Error reporting defect:", err);
      alert("Failed to report defect: " + (err.response?.data?.error || err.message));
    }
  };

  // Update existing defect submission
  const handleUpdateDefect = async (e) => {
    e.preventDefault();
    if (!editSubject.trim() || !editDescription.trim() || !editAssignedTo) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const currentUserId = resolveCurrentUserId();
      const payload = {
        subject: editSubject.trim(),
        description: editDescription.trim(),
        assignedto: Number(editAssignedTo),
        createdby: Number(currentUserId),
        createddate: new Date().toISOString(),
        defectstatusid: Number(editDefectStatusId),
        closedby: Number(editDefectStatusId) === 6 ? Number(currentUserId) : null,
        releaseid: Number(selectedRelease),
        testcases: linkedTestCases.map(tc => ({
          testsuiteid: tc.testsuiteid,
          testcaseid: tc.testcaseid
        }))
      };

      await axios.put(`${API_BASE}/defect/defect/${editDefectId}`, payload);
      setSuccessMsg('Defect updated successfully!');
      setShowEditModal(false);
      
      // Refresh list
      fetchData();
    } catch (err) {
      console.error("Error updating defect:", err);
      alert("Failed to update defect: " + (err.response?.data?.error || err.message));
    }
  };

  // Delete defect
  const handleDeleteDefect = async () => {
    if (!showDeleteConfirm) return;
    try {
      const defectId = showDeleteConfirm.defectid || showDeleteConfirm.id;
      await axios.delete(`${API_BASE}/defect/defect/${defectId}`);
      setSuccessMsg('Defect deleted successfully.');
      setShowDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error("Error deleting defect:", err);
      alert("Failed to delete defect: " + (err.response?.data?.error || err.message));
    }
  };

  // Get status pill component
  const getStatusBadge = (statusid) => {
    const statusText = statusMap[statusid] || 'New';
    let bgClass = "bg-rose-50 text-rose-700 border-rose-200";
    let dotColor = "text-rose-500";
    let icon = <AlertCircle size={12} className={dotColor} />;

    switch (statusid) {
      case 1: // New
        bgClass = "bg-rose-50 text-rose-700 border-rose-200";
        dotColor = "text-rose-500";
        icon = <AlertCircle size={12} className={dotColor} />;
        break;
      case 2: // In Progress
        bgClass = "bg-amber-50 text-amber-700 border-amber-200";
        dotColor = "text-amber-500";
        icon = <Clock size={12} className={dotColor} />;
        break;
      case 3: // Fixed
        bgClass = "bg-sky-50 text-sky-700 border-sky-200";
        dotColor = "text-sky-500";
        icon = <CheckCircle2 size={12} className={dotColor} />;
        break;
      case 4: // Retest Pass
        bgClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
        dotColor = "text-emerald-500";
        icon = <CheckCircle2 size={12} className={dotColor} />;
        break;
      case 5: // Retest Failed
        bgClass = "bg-red-50 text-red-700 border-red-200";
        dotColor = "text-red-500";
        icon = <AlertTriangle size={12} className={dotColor} />;
        break;
      case 6: // Closed
        bgClass = "bg-teal-50 text-teal-700 border-teal-200";
        dotColor = "text-teal-500";
        icon = <CheckCircle2 size={12} className={dotColor} />;
        break;
      case 7: // Cancelled
        bgClass = "bg-slate-100 text-slate-700 border-slate-200";
        dotColor = "text-slate-500";
        icon = <X size={12} className={dotColor} />;
        break;
      case 8: // Reopened
        bgClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
        dotColor = "text-indigo-500";
        icon = <AlertCircle size={12} className={dotColor} />;
        break;
      default:
        bgClass = "bg-slate-50 text-slate-700 border-slate-200";
        dotColor = "text-slate-500";
        icon = <AlertCircle size={12} className={dotColor} />;
        break;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${bgClass}`}>
        {icon}
        {statusText}
      </span>
    );
  };

  // Format date readable
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  if (loading && defects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Top Heading Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <AlertTriangle className="text-indigo-600 animate-pulse" size={32} />
            Defect Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Identify, assign, and manage issues discovered during product releases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedRelease && defects.length > 0 && (
            <button
              onClick={handleDownloadExcel}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Download size={20} />
              Export Excel
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Report Defect
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-2.5">
          <AlertCircle size={20} className="text-rose-500" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* ADVANCED FILTERS PANEL */}
      {selectedRelease && defects.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
            <Filter size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Advanced Filters</h3>
            {(filterSearchText || filterTestSuite || filterTestCase || filterAssignedTo || filterStatus) && (
              <button
                onClick={handleClearFilters}
                className="ml-auto text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Search Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  value={filterSearchText}
                  onChange={(e) => setFilterSearchText(e.target.value)}
                  placeholder="Subject, description..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs"
                />
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            {/* Test Suite Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Test Suite</label>
              <select
                value={filterTestSuite}
                onChange={(e) => handleFilterSuiteChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs border-slate-200"
              >
                <option value="">All Test Suites</option>
                {testSuites.map(s => (
                  <option key={s.testsuiteid || s.id} value={s.testsuiteid || s.id}>
                    {s.testsuitename || s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Case Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Test Case</label>
              <select
                value={filterTestCase}
                onChange={(e) => setFilterTestCase(e.target.value)}
                disabled={!filterTestSuite}
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs disabled:opacity-50 border-slate-200"
              >
                <option value="">All Test Cases</option>
                {filterTestCasesList.map(tc => (
                  <option key={tc.testcaseid} value={tc.testcaseid}>
                    {tc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned To</label>
              <select
                value={filterAssignedTo}
                onChange={(e) => setFilterAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs border-slate-200"
              >
                <option value="">All Developers</option>
                {users.map(u => (
                  <option key={u.UserId || u.id} value={u.UserId || u.id}>
                    {u.UserName || u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Defect Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs border-slate-200"
              >
                <option value="">All Statuses</option>
                {defectStatuses.length > 0 ? (
                  defectStatuses.map(s => (
                    <option key={s.defectstatusid} value={s.defectstatusid}>
                      {s.defectstatus}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">New</option>
                    <option value="2">In Progress</option>
                    <option value="3">Fixed</option>
                    <option value="4">Retest Pass</option>
                    <option value="5">Retest Failed</option>
                    <option value="6">Closed</option>
                    <option value="7">Cancelled</option>
                    <option value="8">Reopened</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Table or Empty State */}
      {!selectedRelease ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <p className="text-slate-500">Please select an active release in the header to view and report defects.</p>
        </div>
      ) : defects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm animate-fadeIn">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <FileText className="text-slate-400" size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No Defects Reported</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Awesome! No defects are logged for this release yet. Click the button below to report an issue.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            Report First Defect
          </button>
        </div>
      ) : filteredDefects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm animate-fadeIn">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Search className="text-slate-400" size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No Matching Defects</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            We couldn't find any defects matching your current filter criteria. Try clearing or relaxing your filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6">Assigned To</th>
                  <th className="py-4 px-6">Created On</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDefects.map((defect) => (

                  <tr key={defect.defectid || defect.id} className="hover:bg-slate-50/60 transition-colors text-slate-700 text-sm group">
                    <td className="py-4 px-6 font-semibold text-indigo-600">
                      #{defect.defectid || defect.id}
                    </td>
                    <td className="py-4 px-6 max-w-md truncate font-medium text-slate-800">
                      {defect.subject}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase">
                          {(userMap[defect.assignedto] || 'U').substring(0, 2)}
                        </div>
                        <span className="font-medium text-slate-600">
                          {userMap[defect.assignedto] || `Developer (ID: ${defect.assignedto})`}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {formatDate(defect.createddate)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(defect.defectstatusid)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedDefect(defect)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(defect)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Defect"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(defect)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Defect"
                        >
                          <Trash2 size={18} />
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

      {/* REPORT DEFECT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={24} />
              Report New Defect
            </h2>
            <p className="text-slate-500 text-xs mb-6">
              Create a work item to report a defect. Ensure all fields are filled accurately for investigation.
            </p>

            <form onSubmit={handleReportDefect} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summarize the bug in a few words..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide steps to reproduce, expected vs actual behavior, and environment details..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Assign To Developer <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm appearance-none"
                >
                  <option value="">-- Choose Developer --</option>
                  {users.map((u) => (
                    <option key={u.UserId || u.id} value={u.UserId || u.id}>
                      {u.UserName || u.name} ({u.role || 'User'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Defect Status <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={defectStatusId}
                  onChange={(e) => setDefectStatusId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm appearance-none"
                >
                  {defectStatuses.length > 0 ? (
                    defectStatuses.map((s) => (
                      <option key={s.defectstatusid} value={s.defectstatusid}>
                        {s.defectstatus}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">New</option>
                      <option value="2">In Progress</option>
                      <option value="3">Fixed</option>
                      <option value="4">Retest Pass</option>
                      <option value="5">Retest Failed</option>
                      <option value="6">Closed</option>
                      <option value="7">Cancelled</option>
                      <option value="8">Reopened</option>
                    </>
                  )}
                </select>
              </div>

              {/* LINK TEST CASES SUB-FORM */}
              <div className="border-t border-slate-100 pt-4 mt-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Tag size={16} className="text-indigo-600" />
                  Map to Test Cases
                </h3>
                
                {/* Linked cases list */}
                <div className="mb-4 space-y-2">
                  {linkedTestCases.length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                      No test cases linked yet. Use the fields below to link test cases.
                    </p>
                  ) : (
                    <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
                      {linkedTestCases.map((tc, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100 text-xs">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-700 block truncate">{tc.caseName}</span>
                            <span className="text-slate-400 text-[10px]">Suite: {tc.suiteName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnlinkTestCase(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors flex-shrink-0"
                            title="Unlink test case"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-form fields */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Test Suite</label>
                      <select
                        value={activeTestSuiteId}
                        onChange={(e) => handleSuiteChange(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      >
                        <option value="">-- Select Suite --</option>
                        {testSuites.map((s) => (
                          <option key={s.testsuiteid || s.id} value={s.testsuiteid || s.id}>
                            {s.testsuitename || s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Test Case</label>
                      <select
                        value={activeTestCaseId}
                        onChange={(e) => setActiveTestCaseId(e.target.value)}
                        disabled={!activeTestSuiteId}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs disabled:opacity-60"
                      >
                        <option value="">-- Select Case --</option>
                        {testCases.map((tc) => (
                          <option key={tc.testcaseid} value={tc.testcaseid}>
                            {tc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLinkTestCase}
                    disabled={!activeTestSuiteId || !activeTestCaseId}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-50 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    Link Test Case
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  Submit Bug
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Defect</h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete defect <span className="font-semibold text-slate-800">#{showDeleteConfirm.defectid || showDeleteConfirm.id}</span>: "{showDeleteConfirm.subject}"? This action is permanent and cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors"
              >
                Keep Defect
              </button>
              <button
                onClick={handleDeleteDefect}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DEFECT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Pencil className="text-indigo-600" size={24} />
              Edit Defect #{editDefectId}
            </h2>
            <p className="text-slate-500 text-xs mb-6">
              Modify the defect details, change its status, or update its linked test cases.
            </p>

            <form onSubmit={handleUpdateDefect} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="Summarize the bug in a few words..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Provide steps to reproduce, expected vs actual behavior, and environment details..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Assign To Developer <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm appearance-none"
                >
                  <option value="">-- Choose Developer --</option>
                  {users.map((u) => (
                    <option key={u.UserId || u.id} value={u.UserId || u.id}>
                      {u.UserName || u.name} ({u.role || 'User'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Defect Status <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={editDefectStatusId}
                  onChange={(e) => setEditDefectStatusId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm appearance-none"
                >
                  {defectStatuses.length > 0 ? (
                    defectStatuses.map((s) => (
                      <option key={s.defectstatusid} value={s.defectstatusid}>
                        {s.defectstatus}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">New</option>
                      <option value="2">In Progress</option>
                      <option value="3">Fixed</option>
                      <option value="4">Retest Pass</option>
                      <option value="5">Retest Failed</option>
                      <option value="6">Closed</option>
                      <option value="7">Cancelled</option>
                      <option value="8">Reopened</option>
                    </>
                  )}
                </select>
              </div>

              {/* LINK TEST CASES SUB-FORM */}
              <div className="border-t border-slate-100 pt-4 mt-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Tag size={16} className="text-indigo-600" />
                  Map to Test Cases
                </h3>
                
                {/* Linked cases list */}
                <div className="mb-4 space-y-2">
                  {linkedTestCases.length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                      No test cases linked yet. Use the fields below to link test cases.
                    </p>
                  ) : (
                    <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
                      {linkedTestCases.map((tc, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100 text-xs">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-700 block truncate">{tc.caseName}</span>
                            <span className="text-slate-400 text-[10px]">Suite: {tc.suiteName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnlinkTestCase(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors flex-shrink-0"
                            title="Unlink test case"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-form fields */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Test Suite</label>
                      <select
                        value={activeTestSuiteId}
                        onChange={(e) => handleSuiteChange(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      >
                        <option value="">-- Select Suite --</option>
                        {testSuites.map((s) => (
                          <option key={s.testsuiteid || s.id} value={s.testsuiteid || s.id}>
                            {s.testsuitename || s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Test Case</label>
                      <select
                        value={activeTestCaseId}
                        onChange={(e) => setActiveTestCaseId(e.target.value)}
                        disabled={!activeTestSuiteId}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs disabled:opacity-60"
                      >
                        <option value="">-- Select Case --</option>
                        {testCases.map((tc) => (
                          <option key={tc.testcaseid} value={tc.testcaseid}>
                            {tc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLinkTestCase}
                    disabled={!activeTestSuiteId || !activeTestCaseId}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-50 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    Link Test Case
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEFECT DETAILS VIEW MODAL */}
      {selectedDefect && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDefect(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                Defect ID #{selectedDefect.defectid || selectedDefect.id}
              </span>
              {getStatusBadge(selectedDefect.defectstatusid)}
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {selectedDefect.subject}
            </h2>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm border border-slate-100 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                  {selectedDefect.description || 'No description provided.'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Assigned To</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {userMap[selectedDefect.assignedto] || `Developer (ID: ${selectedDefect.assignedto})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Reported Date</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {formatDate(selectedDefect.createddate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Created By</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {userMap[selectedDefect.createdby] || `User (ID: ${selectedDefect.createdby})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Tag size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Associated Release ID</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedDefect.releaseid}
                    </p>
                  </div>
                </div>
              </div>

              {/* MAPPED TEST CASES */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag size={14} />
                  Mapped Test Cases
                </h4>
                {selectedDefectTestCases.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                    No test cases mapped to this defect.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {selectedDefectTestCases.map((tc, index) => (
                      <div key={index} className="bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-slate-700 block">{tc.caseName}</span>
                          <span className="text-slate-400 text-[10px]">Suite: {tc.suiteName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={() => setSelectedDefect(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefectList;
