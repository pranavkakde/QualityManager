import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/api';

const TestRunList = ({ selectedRelease }) => {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    if (!selectedRelease) return;
    const fetchRuns = async () => {
      try {
        const tcRes = await axios.get(`${API_BASE}/testcase/release/${selectedRelease}/testcases`);
        const firstTC = Array.isArray(tcRes.data) ? tcRes.data?.[0]?.testcaseid : null;
        if (firstTC) {
          const runRes = await axios.get(`${API_BASE}/testcase/testcaseruns/${firstTC}/testruns`);
          setRuns(Array.isArray(runRes.data) ? runRes.data : []);
        } else {
          setRuns([]);
        }
      } catch (err) {
        console.error("Error fetching runs:", err);
        setRuns([]);
      }
    };
    fetchRuns();
  }, [selectedRelease]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Test Runs</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-left text-sm font-semibold text-slate-500">
              <th className="p-4">Run ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run.testrunid} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{run.testrunid}</td>
                <td className="p-4 text-slate-600">{run.testrunname}</td>
                <td className="p-4 text-slate-500">{new Date(run.startdate).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">{run.testrunstatusid === 1 ? 'Passed' : 'In Progress'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestRunList;
