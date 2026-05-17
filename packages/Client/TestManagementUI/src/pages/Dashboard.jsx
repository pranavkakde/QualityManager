import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TestTube, Bug, Activity } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

const API_BASE = '/api';

const Dashboard = ({ selectedRelease }) => {
  const [data, setData] = useState({ suites: 0, defects: 0, testCases: [] });

  useEffect(() => {
    if (!selectedRelease) return;
    const fetchDashboardData = async () => {
      try {
        const [tcRes, defectRes, suiteRes] = await Promise.all([
          axios.get(`${API_BASE}/testcase/release/${selectedRelease}/testcases`),
          axios.get(`${API_BASE}/testcase/release/${selectedRelease}/defects`),
          axios.get(`${API_BASE}/testcase/release/${selectedRelease}/testsuites`)
        ]);
        
        setData({
          suites: Array.isArray(suiteRes.data) ? suiteRes.data.length : 0,
          defects: Array.isArray(defectRes.data) ? defectRes.data.length : 0,
          testCases: Array.isArray(tcRes.data) ? tcRes.data : []
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchDashboardData();
  }, [selectedRelease]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Test Execution Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Test Suites" value={data.suites} subtitle="Active" color="text-indigo-500" icon={<TestTube className="text-indigo-500" size={24} />} />
        <DashboardCard title="Active Defects" value={data.defects} subtitle="Open" color="text-red-500" icon={<Bug className="text-red-500" size={24} />} />
        <DashboardCard title="Pass Rate" value="--" subtitle="Calculating..." color="text-emerald-500" icon={<Activity className="text-emerald-500" size={24} />} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Test Cases</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm font-semibold text-slate-500 border-b border-slate-200">
                <th className="pb-4 pr-4">ID</th>
                <th className="pb-4 pr-4">Name</th>
                <th className="pb-4 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.testCases.map((tc) => (
                <tr key={tc.testcaseid || tc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="py-4 pr-4 font-medium text-slate-800">{tc.testcaseid || tc.id}</td>
                  <td className="py-4 pr-4 text-slate-600">{tc.name}</td>
                  <td className="py-4 pr-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700`}>
                      {tc.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
