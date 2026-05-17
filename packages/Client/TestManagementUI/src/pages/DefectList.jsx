import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/api';

const DefectList = ({ selectedRelease }) => {
  const [defects, setDefects] = useState([]);

  useEffect(() => {
    if (!selectedRelease) return;
    const fetchDefects = async () => {
      try {
        const res = await axios.get(`${API_BASE}/testcase/release/${selectedRelease}/defects`);
        setDefects(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching defects:", err);
        setDefects([]);
      }
    };
    fetchDefects();
  }, [selectedRelease]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Defects</h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">Report Defect</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-left text-sm font-semibold text-slate-500">
              <th className="p-4">ID</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {defects.map(defect => (
              <tr key={defect.defectid || defect.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{defect.defectid || defect.id}</td>
                <td className="p-4 text-slate-600">{defect.subject || defect.defect_description}</td>
                <td className="p-4">
                  <span className="flex items-center gap-2 text-slate-600 text-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    {defect.status || 'New'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-indigo-600 font-medium hover:underline">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DefectList;
