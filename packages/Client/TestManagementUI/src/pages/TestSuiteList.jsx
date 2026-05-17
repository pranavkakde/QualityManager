import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TestTube } from 'lucide-react';

const API_BASE = '/api';

const TestSuiteList = ({ selectedRelease }) => {
  const [suites, setSuites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedRelease) return;
    const fetchSuites = async () => {
      try {
        const res = await axios.get(`${API_BASE}/testcase/release/${selectedRelease}/testsuites`);
        setSuites(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching suites:", err);
        setSuites([]);
      }
    };
    fetchSuites();
  }, [selectedRelease]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Test Suites</h1>
        <button
          onClick={() => navigate('/suites/add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Add Suite
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suites.map(suite => (
          <div key={suite.testsuiteid || suite.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl"><TestTube className="text-indigo-600" size={24} /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{suite.testsuitename || suite.name}</h3>
                <p className="text-slate-500 text-sm">{suite.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 font-medium hover:bg-slate-100">View Cases</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestSuiteList;
