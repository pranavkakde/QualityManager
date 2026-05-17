import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, LayoutDashboard, TestTube, Bug, Users, Terminal } from 'lucide-react';

const Sidebar = ({ isAdmin }) => (
  <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed shadow-2xl z-20">
    <div className="p-6 flex items-center gap-3 border-b border-slate-800">
      <div className="bg-indigo-500 p-2 rounded-lg">
        <Activity size={24} />
      </div>
      <span className="text-xl font-bold tracking-wider">QualityManager</span>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      {[
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Test Suites', icon: <TestTube size={20} />, path: '/suites' },
        { name: 'Defects', icon: <Bug size={20} />, path: '/defects' },
        { name: 'Test Runs', icon: <Activity size={20} />, path: '/runs' },
        ...(isAdmin ? [
          { name: 'Users', icon: <Users size={20} />, path: '/users' },
          { name: 'System Logs', icon: <Terminal size={20} />, path: '/logs' }
        ] : []),
      ].map((item) => (
        <Link key={item.name} to={item.path} className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-600 transition-colors duration-200 text-slate-300 hover:text-white">
          {item.icon}
          <span className="font-medium">{item.name}</span>
        </Link>
      ))}
    </nav>
  </div>
);

export default Sidebar;
