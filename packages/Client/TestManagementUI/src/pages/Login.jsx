import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo123');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/user/login', { username, password });
      onLogin(true, res.data);
      navigate('/');
    } catch (err) {
      console.error("Login error details:", err.response?.data || err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Invalid credentials";
      alert("Login failed: " + errorMsg);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-wider">QualityManager</h1>
          <p className="text-slate-500 text-sm mt-2">Sign in to continue</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            Sign In (Demo)
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
