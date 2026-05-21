import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, History, Calendar, User, FileText, AlertCircle, Tag, CheckCircle } from 'lucide-react';

const API_BASE = '/api';

const TestCaseVersions = () => {
  const { testcaseid } = useParams();
  const navigate = useNavigate();

  const [testcase, setTestcase] = useState(null);
  const [versions, setVersions] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch active test case info
        const testcaseRes = await axios.get(`${API_BASE}/testcase/${testcaseid}`);
        const cData = Array.isArray(testcaseRes.data) ? testcaseRes.data[0] : testcaseRes.data;
        setTestcase(cData);

        // 2. Fetch versions list
        const versionsRes = await axios.get(`${API_BASE}/testcase/${testcaseid}/versions`);
        setVersions(Array.isArray(versionsRes.data) ? versionsRes.data : []);

        // 3. Fetch users list
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
          console.error("Failed to load users list:", uErr);
        }
      } catch (err) {
        console.error("Error loading test case versions:", err);
        setError('Failed to load version history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testcaseid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium">Retrieving version timeline...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
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

      {/* active details card */}
      {testcase && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-2">
            <History className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-extrabold text-slate-800">Version Audit Log</h1>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Audit history tracking for <span className="font-extrabold text-slate-800">"{testcase.name}"</span>
          </p>

          <div className="flex flex-wrap gap-3 items-center pt-3 border-t border-slate-100 text-slate-500 text-xs">
            <span className="font-bold flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
              <Tag size={12} /> Active Version: {testcase.versionid || 'v1'}
            </span>
            <span className="font-bold flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              <User size={12} /> Created by: {userMap[testcase.author] || `User ${testcase.author}`}
            </span>
            {testcase.tag && (
              <span className="font-bold flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                🏷️ Tag: {testcase.tag}
              </span>
            )}
            {getStatusBadge(testcase.statusid)}
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        📂 Historical Timeline ({versions.length})
      </h2>

      {versions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <History className="text-slate-400" size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No Version History</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            This test case only has its active state log.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-dashed border-slate-200 ml-4 pl-8 space-y-8 pb-4">
          {versions.map((ver, idx) => {
            const formattedDate = ver.createdat 
              ? new Date(ver.createdat).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })
              : 'Unknown Date';

            const isActiveVersion = testcase && ver.versionid === testcase.versionid;

            return (
              <div key={ver.id || ver.versionid} className="relative">
                {/* Timeline node icon */}
                <span className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors ${
                  isActiveVersion 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {isActiveVersion ? <CheckCircle size={12} /> : <span className="text-[10px] font-black">{versions.length - idx}</span>}
                </span>

                {/* Timeline Card */}
                <div className={`p-6 rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
                  isActiveVersion 
                    ? 'ring-2 ring-indigo-500 ring-offset-2 border-transparent' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md flex items-center gap-1">
                        <Tag size={12} /> {ver.versionid}
                      </span>
                      {isActiveVersion && (
                        <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          Active State
                        </span>
                      )}
                      {ver.tag && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                          🏷️ {ver.tag}
                        </span>
                      )}
                      <h3 className="font-extrabold text-slate-800 text-base">{ver.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formattedDate}
                      </span>
                    </div>
                  </div>

                  {ver.description && (
                    <div className="mb-4 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                      <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Description</span>
                      {ver.description}
                    </div>
                  )}

                  {ver.prerequisite && (
                    <div className="mb-4 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                      <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Prerequisites</span>
                      {ver.prerequisite}
                    </div>
                  )}

                  <div className="flex gap-4 items-center pt-3 border-t border-slate-100 text-xs text-slate-500 font-bold">
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-slate-400" /> By: {userMap[ver.author] || `User ${ver.author}`}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px] uppercase font-black tracking-wider">Status:</span>
                      {getStatusBadge(ver.statusid)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TestCaseVersions;
