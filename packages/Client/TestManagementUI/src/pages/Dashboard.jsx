import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TestTube, 
  Bug, 
  Activity, 
  ClipboardList, 
  PlayCircle, 
  BarChart3, 
  AlertCircle 
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

const API_BASE = '/api';

const Dashboard = ({ selectedRelease }) => {
  const [data, setData] = useState({
    suites: 0,
    defects: 0,
    activeDefects: 0,
    testCases: [],
    runsCount: 0,
    passRate: 0,
    executionProgress: 0,
    defectDensity: "0.0",
    defectResolutionRate: 100,
    runCaseStats: {
      total: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      other: 0
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedRelease) return;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch test cases, defects (real API), and test suites in parallel
        const [tcRes, defectRes, suiteRes, runsRes] = await Promise.all([
          axios.get(`${API_BASE}/testcase/release/${selectedRelease}/testcases`).catch(err => {
            console.error("Dashboard error fetching testcases:", err);
            return { data: [] };
          }),
          axios.get(`${API_BASE}/defect/defects?releaseid=${selectedRelease}`).catch(err => {
            console.error("Dashboard error fetching defects:", err);
            return { data: [] };
          }),
          axios.get(`${API_BASE}/testcase/release/${selectedRelease}/testsuites`).catch(err => {
            console.error("Dashboard error fetching testsuites:", err);
            return { data: [] };
          }),
          axios.get(`${API_BASE}/testcase/testruns/all`).catch(err => {
            console.error("Dashboard error fetching testruns:", err);
            return { data: [] };
          })
        ]);

        const suites = Array.isArray(suiteRes.data) ? suiteRes.data : [];
        const suiteIds = suites.map(s => s.testsuiteid || s.id);

        const allRuns = Array.isArray(runsRes.data) ? runsRes.data : [];
        // Filter runs to only include those belonging to the active release's suites
        const releaseRuns = allRuns.filter(run => suiteIds.includes(run.testsuiteid));

        const defects = Array.isArray(defectRes.data) ? defectRes.data : [];
        // Active defects: statuses [1, 2, 5, 8] (New, In Progress, Retest Failed, Reopened)
        const activeDefects = defects.filter(d => [1, 2, 5, 8].includes(Number(d.defectstatusid))).length;

        // Fetch run case execution details to compile Pass% and progress metrics
        let totalCasesInRuns = 0;
        let passedCasesInRuns = 0;
        let failedCasesInRuns = 0;
        let blockedCasesInRuns = 0;
        let otherCasesInRuns = 0;

        if (releaseRuns.length > 0) {
          const runCasesPromises = releaseRuns.map(run => 
            axios.get(`${API_BASE}/testcase/testruns/${run.testrunid || run.id}/cases`)
          );
          const runCasesResults = await Promise.all(runCasesPromises);
          
          runCasesResults.forEach(res => {
            const cases = Array.isArray(res.data) ? res.data : [];
            cases.forEach(c => {
              totalCasesInRuns++;
              const status = (c.status || '').toLowerCase();
              if (status === 'passed') {
                passedCasesInRuns++;
              } else if (status === 'failed') {
                failedCasesInRuns++;
              } else if (status === 'blocked') {
                blockedCasesInRuns++;
              } else {
                otherCasesInRuns++;
              }
            });
          });
        }

        const passRate = totalCasesInRuns > 0 
          ? Math.round((passedCasesInRuns / totalCasesInRuns) * 100) 
          : 0;

        const executionProgress = totalCasesInRuns > 0
          ? Math.round(((passedCasesInRuns + failedCasesInRuns + blockedCasesInRuns) / totalCasesInRuns) * 100)
          : 0;

        const testCasesArray = Array.isArray(tcRes.data) ? tcRes.data : [];
        const totalTestCases = testCasesArray.length;
        const closedDefects = defects.length - activeDefects;
        const defectResolutionRate = defects.length > 0
          ? Math.round((closedDefects / defects.length) * 100)
          : 100;
        const defectDensity = totalTestCases > 0
          ? ((activeDefects / totalTestCases) * 100).toFixed(1)
          : "0.0";

        setData({
          suites: suites.length,
          defects: defects.length,
          activeDefects,
          testCases: testCasesArray,
          runsCount: releaseRuns.length,
          passRate,
          executionProgress,
          defectDensity,
          defectResolutionRate,
          runCaseStats: {
            total: totalCasesInRuns,
            passed: passedCasesInRuns,
            failed: failedCasesInRuns,
            blocked: blockedCasesInRuns,
            other: otherCasesInRuns
          }
        });
      } catch (err) {
        console.error("[Dashboard] Error fetching dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedRelease]);

  if (!selectedRelease) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <p className="text-slate-500">Please select an active release in the header to view metrics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate percentage splits for the distribution visual bar
  const totalExecs = data.runCaseStats.total || 1;
  const passPercent = Math.round((data.runCaseStats.passed / totalExecs) * 100);
  const failPercent = Math.round((data.runCaseStats.failed / totalExecs) * 100);
  const blockPercent = Math.round((data.runCaseStats.blocked / totalExecs) * 100);
  const pendingPercent = Math.max(0, 100 - (passPercent + failPercent + blockPercent));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Dashboard Heading */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-indigo-600" size={32} />
            Test Execution Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time quality metrics, active defects, and test run progression for the active release.
          </p>
        </div>
      </div>

      {/* Unified Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Suites Card */}
        <DashboardCard 
          title="Total Test Suites" 
          value={data.suites} 
          subtitle="Configured" 
          color="text-indigo-600 bg-indigo-50" 
          icon={<TestTube size={24} />} 
          subtitleColor="text-indigo-700 bg-indigo-50 border-indigo-100"
        />
        {/* Core Cases Card */}
        <DashboardCard 
          title="Total Test Cases" 
          value={data.testCases.length} 
          subtitle="Registered Cases" 
          color="text-violet-600 bg-violet-50" 
          icon={<ClipboardList size={24} />} 
          subtitleColor="text-violet-700 bg-violet-50 border-violet-100"
        />
        {/* Dynamic Active Defects Card */}
        <DashboardCard 
          title="Active Defects" 
          value={data.activeDefects} 
          subtitle={`${data.defects - data.activeDefects} Closed/Fixed`} 
          color="text-rose-600 bg-rose-50" 
          icon={<Bug size={24} />} 
          subtitleColor={data.activeDefects > 0 ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-slate-600 bg-slate-50 border-slate-200'}
        />
        {/* Dynamic Pass Rate Card */}
        <DashboardCard 
          title="Pass Rate" 
          value={`${data.passRate}%`} 
          subtitle={`${data.runCaseStats.passed} / ${data.runCaseStats.total} Executions`} 
          color="text-emerald-600 bg-emerald-50" 
          icon={<Activity size={24} />} 
          subtitleColor={data.passRate >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : data.runCaseStats.total > 0 ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-slate-600 bg-slate-50 border-slate-200'}
        />
        {/* Dynamic Runs Count Card */}
        <DashboardCard 
          title="Total Test Runs" 
          value={data.runsCount} 
          subtitle="Execution Cycles" 
          color="text-amber-600 bg-amber-50" 
          icon={<PlayCircle size={24} />} 
          subtitleColor="text-amber-700 bg-amber-50 border-amber-100"
        />
        {/* Dynamic Execution Progress Card */}
        <DashboardCard 
          title="Execution Progress" 
          value={`${data.executionProgress}%`} 
          subtitle="Run Completion" 
          color="text-cyan-600 bg-cyan-50" 
          icon={<BarChart3 size={24} />} 
          subtitleColor={data.executionProgress === 100 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-cyan-700 bg-cyan-50 border-cyan-100'}
        />
        {/* Defect Density Card */}
        <DashboardCard 
          title="Defect Density" 
          value={`${data.defectDensity}%`} 
          subtitle="Active per 100 TCs" 
          color="text-red-600 bg-red-50" 
          icon={<AlertCircle size={24} />} 
          subtitleColor={Number(data.defectDensity) > 10 ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-slate-600 bg-slate-50 border-slate-200'}
        />
        {/* Defect Resolution Card */}
        <DashboardCard 
          title="Defect Resolution" 
          value={`${data.defectResolutionRate}%`} 
          subtitle="Closed / Fixed" 
          color="text-teal-600 bg-teal-50" 
          icon={<Bug size={24} />} 
          subtitleColor={data.defectResolutionRate >= 85 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-amber-700 bg-amber-50 border-amber-100'}
        />
        {/* Remaining Cases Card */}
        <DashboardCard 
          title="Remaining Cases" 
          value={data.runCaseStats.other} 
          subtitle="Pending Run Cases" 
          color="text-sky-600 bg-sky-50" 
          icon={<Activity size={24} />} 
          subtitleColor="text-sky-700 bg-sky-50 border-sky-100"
        />
      </div>

      {/* Distribution Analytics Section */}
      {data.runCaseStats.total > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Test Execution Distribution</h3>
          
          {/* Visual Stacked Bar */}
          <div className="w-full h-5 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            {passPercent > 0 && (
              <div 
                style={{ width: `${passPercent}%` }} 
                className="bg-emerald-500 hover:bg-emerald-600 transition-all duration-200"
                title={`Passed: ${data.runCaseStats.passed} (${passPercent}%)`}
              />
            )}
            {failPercent > 0 && (
              <div 
                style={{ width: `${failPercent}%` }} 
                className="bg-rose-500 hover:bg-rose-600 transition-all duration-200"
                title={`Failed: ${data.runCaseStats.failed} (${failPercent}%)`}
              />
            )}
            {blockPercent > 0 && (
              <div 
                style={{ width: `${blockPercent}%` }} 
                className="bg-amber-500 hover:bg-amber-600 transition-all duration-200"
                title={`Blocked: ${data.runCaseStats.blocked} (${blockPercent}%)`}
              />
            )}
            {pendingPercent > 0 && (
              <div 
                style={{ width: `${pendingPercent}%` }} 
                className="bg-sky-400 hover:bg-sky-500 transition-all duration-200 animate-pulse"
                title={`Pending/Other: ${data.runCaseStats.other} (${pendingPercent}%)`}
              />
            )}
          </div>

          {/* Interactive Legend Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-700">Passed:</span>
              <span className="text-xs text-slate-500">{data.runCaseStats.passed} ({passPercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-rose-500" />
              <span className="text-xs font-semibold text-slate-700">Failed:</span>
              <span className="text-xs text-slate-500">{data.runCaseStats.failed} ({failPercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-amber-500" />
              <span className="text-xs font-semibold text-slate-700">Blocked:</span>
              <span className="text-xs text-slate-500">{data.runCaseStats.blocked} ({blockPercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-sky-400" />
              <span className="text-xs font-semibold text-slate-700">Pending:</span>
              <span className="text-xs text-slate-500">{data.runCaseStats.other} ({pendingPercent}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Test Cases Section */}
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
              {data.testCases.slice(0, 5).map((tc) => (
                <tr key={tc.testcaseid || tc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="py-4 pr-4 font-semibold text-indigo-600">#{tc.testcaseid || tc.id}</td>
                  <td className="py-4 pr-4 text-slate-700 font-medium">{tc.name}</td>
                  <td className="py-4 pr-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {tc.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.testCases.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 text-sm">
                    No test cases registered for this release yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
