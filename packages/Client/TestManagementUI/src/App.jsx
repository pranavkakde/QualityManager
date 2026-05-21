import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestSuiteList from './pages/TestSuiteList';
import AddTestSuite from './pages/AddTestSuite';
import TestCaseList from './pages/TestCaseList';
import AddTestCase from './pages/AddTestCase';
import TestCaseListGlobal from './pages/TestCaseListGlobal';
import EditTestCase from './pages/EditTestCase';
import TestCaseVersions from './pages/TestCaseVersions';
import TestStepList from './pages/TestStepList';
import DefectList from './pages/DefectList';
import TestRunList from './pages/TestRunList';
import UserManagement from './pages/UserManagement';
import LogViewer from './pages/LogViewer';

const API_BASE = '/api';

const isTokenValid = (token) => {
  if (!token) return false;
  
  // Use robust client-relative expiration if available to prevent clock-drift issues
  const storedExpiresAt = localStorage.getItem('token_expires_at');
  if (storedExpiresAt) {
    return Date.now() < parseInt(storedExpiresAt, 10);
  }

  if (token === 'demo-token-jwt') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.warn("[AUTH] Token has expired client-side.");
      return false;
    }
    return true;
  } catch (e) {
    console.error("[AUTH] Error checking token client-side:", e);
    return false;
  }
};

const getTokenExpirationTime = (token) => {
  if (!token) return null;

  // Primary: Use robust client-relative expiration if available to prevent clock-drift issues
  const storedExpiresAt = localStorage.getItem('token_expires_at');
  if (storedExpiresAt) {
    return parseInt(storedExpiresAt, 10);
  }

  if (token === 'demo-token-jwt') {
    const storedDemoExp = localStorage.getItem('demo_token_exp');
    if (storedDemoExp) {
      return parseInt(storedDemoExp, 10);
    }
    return Date.now() + 3600 * 1000;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp) {
      return payload.exp * 1000;
    }
  } catch (e) {
    console.error("[AUTH] Error parsing token expiration:", e);
  }
  return null;
};

function App() {
  const checkStoredToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    if (!isTokenValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('demo_token_exp');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      return false;
    }
    return true;
  };

  const [isAuthenticated, setIsAuthenticated] = useState(checkStoredToken());
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'admin');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [releases, setReleases] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState(null);

  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryCountdown, setExpiryCountdown] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/project/projects`);
      const data = Array.isArray(res.data) ? res.data : [];
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].projectid);
      } else {
        setSelectedProject(null);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
      setSelectedProject(null);
    }
  };

  useEffect(() => {
    if (!selectedProject) return;
    const fetchReleases = async () => {
      try {
        const res = await axios.get(`${API_BASE}/project/project/${selectedProject}/releases`);
        const data = Array.isArray(res.data) ? res.data : [];
        setReleases(data);
        if (data.length > 0) {
          setSelectedRelease(data[0].id || data[0].releaseid);
        } else {
          setSelectedRelease(null);
        }
      } catch (err) {
        console.error("Error fetching releases:", err);
        setReleases([]);
        setSelectedRelease(null);
      }
    };
    fetchReleases();
  }, [selectedProject]);

  const handleLogin = (status, userData) => {
    if (status && userData) {
      localStorage.setItem('token', userData.token);
      if (userData.refreshToken) {
        localStorage.setItem('refreshToken', userData.refreshToken);
      }
      
      // Calculate and store client-relative expiration to prevent clock drift issues
      const expiresInSec = userData.expiresIn || 3600;
      const expiresAt = Date.now() + expiresInSec * 1000;
      localStorage.setItem('token_expires_at', expiresAt.toString());

      if (userData.token === 'demo-token-jwt') {
        const expTime = Date.now() + (userData.expiresIn || 3600) * 1000;
        localStorage.setItem('demo_token_exp', expTime.toString());
      }
      localStorage.setItem('username', userData.username);
      localStorage.setItem('role', userData.role || 'tester');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      setIsAdmin(userData.role === 'admin');
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('demo_token_exp');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setIsAdmin(false);
    setShowExpiryModal(false);
  };

  const handleExtendSession = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn("[AUTH] No refresh token found. Logging out.");
      handleLogout();
      return;
    }

    setIsRefreshing(true);
    try {
      const res = await axios.post(`${API_BASE}/user/refresh`, { refreshToken });
      if (res.data && res.data.token) {
        handleLogin(true, {
          token: res.data.token,
          refreshToken: res.data.refreshToken || refreshToken,
          expiresIn: res.data.expiresIn || 3600,
          username: localStorage.getItem('username'),
          role: localStorage.getItem('role')
        });
        setShowExpiryModal(false);
      } else {
        throw new Error("Invalid token refresh response");
      }
    } catch (err) {
      console.error("[AUTH] Session extension failed:", err);
      handleLogout();
      alert("Failed to extend session. Please sign in again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      const expTime = getTokenExpirationTime(token);

      if (!expTime) return;

      const remainingMs = expTime - Date.now();
      const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        console.warn("[AUTH] Session expired. Automatically logging out.");
        handleLogout();
        alert("Your session has expired. Please sign in again.");
      } else if (remainingSeconds <= 60) {
        setExpiryCountdown(remainingSeconds);
        setShowExpiryModal(true);
      } else {
        setShowExpiryModal(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("[AXIOS] 401 Unauthorized detected. Logging out...");
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Sidebar isAdmin={isAdmin} />

        <div className="pl-64 min-h-screen flex flex-col">
          <Header
            projects={projects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            releases={releases}
            selectedRelease={selectedRelease}
            setSelectedRelease={setSelectedRelease}
            onLogout={handleLogout}
          />

          <div className="flex-1 bg-slate-50">
            <Routes>
              <Route path="/" element={<Dashboard selectedRelease={selectedRelease} />} />
              <Route path="/suites" element={<TestSuiteList selectedRelease={selectedRelease} />} />
              <Route path="/suites/add" element={<AddTestSuite selectedRelease={selectedRelease} />} />
              <Route path="/suites/:testsuiteid/cases" element={<TestCaseList />} />
              <Route path="/suites/:testsuiteid/cases/add" element={<AddTestCase />} />
              <Route path="/cases" element={<TestCaseListGlobal selectedRelease={selectedRelease} />} />
              <Route path="/testcases/:testcaseid/edit" element={<EditTestCase />} />
              <Route path="/testcases/:testcaseid/versions" element={<TestCaseVersions />} />
              <Route path="/testcases/:testcaseid/steps" element={<TestStepList />} />
              <Route path="/defects" element={<DefectList selectedRelease={selectedRelease} />} />
              <Route path="/runs" element={<TestRunList selectedRelease={selectedRelease} />} />
              {isAdmin && (
                <>
                  <Route path="/users" element={<UserManagement projects={projects} />} />
                  <Route path="/logs" element={<LogViewer />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
      
      {showExpiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="bg-white/95 border border-slate-200/80 rounded-2xl p-8 max-w-sm w-full shadow-2xl backdrop-blur-xl transform transition-all duration-300 scale-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-5 animate-pulse text-amber-500">
              <ShieldAlert size={36} />
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-2">Session Expiring</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your security session will expire in <span className="font-semibold text-amber-600 tabular-nums">{expiryCountdown}s</span>. Would you like to extend it?
            </p>
            
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleExtendSession}
                disabled={isRefreshing}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Extending...' : 'Extend Session'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl font-semibold active:scale-95 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
