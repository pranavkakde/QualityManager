import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/api';

const UserManagement = ({ projects }) => {
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', groupid: 2 });
  const [selectedUserForMapping, setSelectedUserForMapping] = useState(null);
  const [userProjects, setUserProjects] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/users`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/user/user`, newUser);
      setShowAdd(false);
      fetchUsers();
    } catch (err) {
      alert("Error adding user");
    }
  };

  const fetchUserProjects = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/user/user/${userId}/projects`);
      setUserProjects(Array.isArray(res.data) ? res.data.map(p => p.projectid) : []);
      setSelectedUserForMapping(userId);
    } catch (err) {
      console.error("Error fetching user projects:", err);
      setUserProjects([]);
    }
  };

  const toggleProjectMapping = async (projectId) => {
    try {
      if (userProjects.includes(projectId)) {
        await axios.delete(`${API_BASE}/user/user/${selectedUserForMapping}/project/${projectId}`);
        setUserProjects(userProjects.filter(id => id !== projectId));
      } else {
        await axios.post(`${API_BASE}/user/project`, { userid: selectedUserForMapping, projectid: projectId });
        setUserProjects([...userProjects, projectId]);
      }
    } catch (err) {
      alert("Error updating mapping");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
        >
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-sm font-semibold text-slate-500">
                <th className="p-4">Username</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.UserId} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50 ${selectedUserForMapping === u.UserId ? 'bg-indigo-50' : ''}`}>
                  <td className="p-4 font-medium text-slate-800">{u.UserName}</td>
                  <td className="p-4 text-slate-600">{u.GroupId === 1 ? 'Admin' : 'Tester'}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => fetchUserProjects(u.UserId)}
                      className="text-indigo-600 font-medium hover:underline"
                    >
                      Map Projects
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUserForMapping && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-6">
              Project Access for {users.find(u => u.UserId === selectedUserForMapping)?.UserName}
            </h2>
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.projectid} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <input 
                    type="checkbox" 
                    checked={userProjects.includes(p.projectid)}
                    onChange={() => toggleProjectMapping(p.projectid)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Create New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={newUser.groupid}
                  onChange={e => setNewUser({...newUser, groupid: Number(e.target.value)})}
                >
                  <option value={2}>Tester</option>
                  <option value={1}>Admin</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2 text-slate-600 font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow-lg hover:bg-indigo-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
