import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, FileText, AlertCircle, User, Tag } from 'lucide-react';

const API_BASE = '/api';

const TestCaseList = () => {
  const { testsuiteid } = useParams();
  const navigate = useNavigate();
  const [suite, setSuite] = useState(null);
  const [cases, setCases] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const suiteRes = await axios.get(`${API_BASE}/testsuite/${testsuiteid}`);
        setSuite(suiteRes.data);

        const casesRes = await axios.get(`${API_BASE}/testsuite/${testsuiteid}/testcases`);
        const fetchedCases = Array.isArray(casesRes.data) ? casesRes.data : [];
        setCases(fetchedCases);

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

        setError('');
      } catch (err) {
        console.error("Error fetching suite test cases:", err);
        setError('Failed to load test cases. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testsuiteid]);

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
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">New</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/suites')}
        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Test Suites
      </button>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {suite && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{suite.name}</h1>
              <p className="text-slate-500 max-w-2xl">{suite.description}</p>
            </div>
            <button
              onClick={() => navigate(`/suites/${testsuiteid}/cases/add`)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus size={18} /> Add Test Case
            </button>
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold text-slate-800 mb-4">Test Cases ({cases.length})</h2>

      {cases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <FileText className="text-slate-400" size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No Test Cases Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">Create test cases inside this suite to start tracking and running executions.</p>
          <button
            onClick={() => navigate(`/suites/${testsuiteid}/cases/add`)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Create First Test Case
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm font-bold">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Prerequisites</th>
                  <th className="py-4 px-6">Version</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Author</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((testcase) => (
                  <tr key={testcase.testcaseid} className="hover:bg-slate-50/80 transition-colors text-slate-700 text-sm">
                    <td className="py-4 px-6 font-bold text-slate-800">{testcase.name}</td>
                    <td className="py-4 px-6 max-w-xs truncate">{testcase.description || '-'}</td>
                    <td className="py-4 px-6 max-w-xs truncate">{testcase.prerequisite || '-'}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Tag size={12} /> {testcase.versionid || 'v1'}
                      </span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(testcase.statusid)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="font-semibold text-slate-600">
                          {userMap[testcase.author] || `User ${testcase.author}` || 'unknown'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseList;
