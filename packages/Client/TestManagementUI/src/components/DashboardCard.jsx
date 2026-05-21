import React from 'react';

const DashboardCard = ({ title, value, subtitle, color, icon, subtitleColor = 'text-emerald-700 bg-emerald-50 border-emerald-100' }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h3 className="text-slate-500 font-semibold text-sm tracking-tight">{title}</h3>
    </div>
    <div className="mt-4 flex items-baseline justify-between gap-2 flex-wrap">
      <span className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">{value}</span>
      {subtitle && (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${subtitleColor} tracking-wide`}>
          {subtitle}
        </span>
      )}
    </div>
  </div>
);

export default DashboardCard;
