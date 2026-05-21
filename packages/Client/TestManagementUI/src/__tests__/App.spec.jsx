import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import App from '../App';

vi.mock('axios');

describe('App Component Spec', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders login screen when not authenticated', async () => {
    render(<App />);

    expect(screen.getByText('QualityManager')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders dashboard with project and release dropdowns when authenticated', async () => {
    localStorage.setItem('token', 'demo-token-jwt');
    localStorage.setItem('username', 'admin');
    localStorage.setItem('role', 'admin');

    const mockProjects = [
      { projectid: 1, name: 'Alpha Project', description: 'Alpha Desc' },
      { projectid: 2, name: 'Beta Project', description: 'Beta Desc' },
    ];
    const mockReleases = [
      { releaseid: 10, name: 'v1.0', description: 'Release 1.0' },
    ];

    axios.get = vi.fn().mockImplementation((url) => {
      if (url.includes('/project/projects')) {
        return Promise.resolve({ data: mockProjects });
      }
      if (url.includes('/project/project/1/releases')) {
        return Promise.resolve({ data: mockReleases });
      }
      if (url.includes('/testcase/release/')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/defect/defects')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/testcase/testruns/')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Project')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('v1.0')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Execution Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Test Suites')).toBeInTheDocument();
    expect(screen.getByText('Active Defects')).toBeInTheDocument();
    expect(screen.getByText('Pass Rate')).toBeInTheDocument();
  });
});
