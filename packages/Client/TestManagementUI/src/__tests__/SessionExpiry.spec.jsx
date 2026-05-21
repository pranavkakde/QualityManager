import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import App from '../App';

vi.mock('axios');

describe('Session Expiration and Warning Spec', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the warning modal when the token is about to expire in <= 60 seconds', async () => {
    localStorage.setItem('token', 'demo-token-jwt');
    localStorage.setItem('refreshToken', 'demo-refresh-token');
    localStorage.setItem('username', 'admin');
    localStorage.setItem('role', 'admin');

    // Set demo token expiration to 50 seconds in the future
    const expTime = Date.now() + 50 * 1000;
    localStorage.setItem('demo_token_exp', expTime.toString());

    const mockProjects = [];
    axios.get = vi.fn().mockImplementation((url) => {
      if (url.includes('/project/projects')) {
        return Promise.resolve({ data: mockProjects });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<App />);

    // Fast-forward by 1 second to trigger the check
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Warning modal should now be shown
    expect(screen.getByText('Session Expiring')).toBeInTheDocument();
    expect(screen.getByText(/Your security session will expire in/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Extend Session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });

  it('automatically logs out when countdown reaches 0 seconds', async () => {
    localStorage.setItem('token', 'demo-token-jwt');
    localStorage.setItem('refreshToken', 'demo-refresh-token');
    localStorage.setItem('username', 'admin');
    localStorage.setItem('role', 'admin');

    // Set demo token expiration to 5 seconds in the future
    const expTime = Date.now() + 5 * 1000;
    localStorage.setItem('demo_token_exp', expTime.toString());

    const mockProjects = [];
    axios.get = vi.fn().mockImplementation((url) => {
      if (url.includes('/project/projects')) {
        return Promise.resolve({ data: mockProjects });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    // Mock window alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<App />);

    // Advance 6 seconds to trigger auto logout
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });

    // Should render login screen again since we are logged out
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(alertMock).toHaveBeenCalledWith('Your session has expired. Please sign in again.');
    expect(localStorage.getItem('token')).toBeNull();

    alertMock.mockRestore();
  });

  it('extends the session successfully when clicking Extend Session', async () => {
    localStorage.setItem('token', 'demo-token-jwt');
    localStorage.setItem('refreshToken', 'demo-refresh-token');
    localStorage.setItem('username', 'admin');
    localStorage.setItem('role', 'admin');

    // Set demo token expiration to 30 seconds in the future
    const expTime = Date.now() + 30 * 1000;
    localStorage.setItem('demo_token_exp', expTime.toString());

    const mockProjects = [];
    axios.get = vi.fn().mockImplementation((url) => {
      if (url.includes('/project/projects')) {
        return Promise.resolve({ data: mockProjects });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    axios.post = vi.fn().mockImplementation((url, body) => {
      if (url.includes('/api/user/refresh')) {
        return Promise.resolve({
          data: {
            token: 'demo-token-jwt',
            refreshToken: 'demo-refresh-token',
            expiresIn: 3600
          }
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(<App />);

    // Advance 1 second to show modal
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Session Expiring')).toBeInTheDocument();

    const extendBtn = screen.getByRole('button', { name: /Extend Session/i });

    // Click extend button
    await act(async () => {
      extendBtn.click();
    });

    // Advance timers asynchronously to flush microtasks and resolve the axios Promise
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(axios.post).toHaveBeenCalledWith('/api/user/refresh', { refreshToken: 'demo-refresh-token' });

    // The modal should close
    expect(screen.queryByText('Session Expiring')).toBeNull();
  });
});
