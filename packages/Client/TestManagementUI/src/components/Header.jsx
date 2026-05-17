import React, { useState } from 'react';
import { Folder, GitBranch, LogOut } from 'lucide-react';

const Header = ({ projects, selectedProject, setSelectedProject, releases, selectedRelease, setSelectedRelease, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Folder size={18} className="text-indigo-500" />
          <select 
            value={selectedProject || ''} 
            onChange={(e) => setSelectedProject(Number(e.target.value))}
            className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
          >
            {projects.map(p => <option key={p.projectid} value={p.projectid}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <GitBranch size={18} className="text-emerald-500" />
          <select 
            value={selectedRelease || ''} 
            onChange={(e) => setSelectedRelease(Number(e.target.value))}
            className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
          >
            {releases.map(r => <option key={r.id || r.releaseid} value={r.id || r.releaseid}>{r.name || r.releasename}</option>)}
          </select>
        </div>
      </div>
      
      <div className="relative">
        <div 
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:opacity-90"
        >
          {localStorage.getItem('username')?.substring(0,2).toUpperCase() || 'US'}
        </div>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-2 border-b border-slate-50 mb-1">
              <p className="text-sm font-bold text-slate-800 truncate">{localStorage.getItem('username')}</p>
              <p className="text-xs text-slate-500 capitalize">{localStorage.getItem('role')}</p>
            </div>
            <button 
              onClick={() => {
                setShowDropdown(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
