import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestSuiteList from './pages/TestSuiteList';
import AddTestSuite from './pages/AddTestSuite';
import TestCaseList from './pages/TestCaseList';
import AddTestCase from './pages/AddTestCase';
import DefectList from './pages/DefectList';
import TestRunList from './pages/TestRunList';
import UserManagement from './pages/UserManagement';
import LogViewer from './pages/LogViewer';

const API_BASE = '/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'admin');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [releases, setReleases] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState(null);

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
      localStorage.setItem('username', userData.username);
      localStorage.setItem('role', userData.role || 'tester');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      setIsAdmin(userData.role === 'admin');
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

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
    </Router>
  );
}

export default App;
