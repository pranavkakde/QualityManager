import React from 'react';

const DashboardCard = ({ title, value, subtitle, color, icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>{icon}</div>
    </div>
    <h3 className="text-slate-500 font-medium">{title}</h3>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-3xl font-bold text-slate-800">{value}</span>
      <span className="text-sm font-medium text-emerald-500">{subtitle}</span>
    </div>
  </div>
);

export default DashboardCard;
