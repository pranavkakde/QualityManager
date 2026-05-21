import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import TestCaseListGlobal from '../pages/TestCaseListGlobal';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('axios');

describe('TestCaseListGlobal Component Spec', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spin indicator initially', () => {
    axios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<TestCaseListGlobal selectedRelease="1" />);
    expect(screen.getByClassName ? screen.getByClassName('animate-spin') : document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders all test cases initially when scoping is all', async () => {
    axios.get = vi.fn().mockImplementation((url) => {
      if (url.includes('/testsuites')) {
        return Promise.resolve({
          data: [
            { testsuiteid: 1, name: 'Auth Suite', description: 'Authentication' },
            { testsuiteid: 2, name: 'Checkout Suite', description: 'Checkout flow' }
          ]
        });
      }
      if (url.includes('/testcases')) {
        return Promise.resolve({
          data: [
            { testcaseid: 10, name: 'Login Case', description: 'Logs in user', versionid: 'v1', statusid: 2, author: 2, testsuiteid: 1 },
            { testcaseid: 20, name: 'Payment Case', description: 'Process payment', versionid: 'v1', statusid: 3, author: 2, testsuiteid: 2 }
          ]
        });
      }
      if (url.includes('/user/users')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Unknown url: ' + url));
    });

    render(<TestCaseListGlobal selectedRelease="1" />);

    await waitFor(() => {
      expect(screen.getByText('Login Case')).toBeInTheDocument();
      expect(screen.getByText('Payment Case')).toBeInTheDocument();
      expect(screen.getByText(/Total Test Cases:/)).toBeInTheDocument();
      expect(screen.getAllByText('2')[0]).toBeInTheDocument();
    });
  });

  it('filters test cases correctly when a test suite is selected', async () => {
    axios.get = vi.fn().mockImplementation((url) => {
      if (url.includes('/testsuites')) {
        return Promise.resolve({
          data: [
            { testsuiteid: 1, name: 'Auth Suite', description: 'Authentication' },
            { testsuiteid: 2, name: 'Checkout Suite', description: 'Checkout flow' }
          ]
        });
      }
      if (url.includes('/testcases')) {
        return Promise.resolve({
          data: [
            { testcaseid: 10, name: 'Login Case', description: 'Logs in user', versionid: 'v1', statusid: 2, author: 2, testsuiteid: 1 },
            { testcaseid: 20, name: 'Payment Case', description: 'Process payment', versionid: 'v1', statusid: 3, author: 2, testsuiteid: 2 }
          ]
        });
      }
      if (url.includes('/user/users')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Unknown url: ' + url));
    });

    const user = userEvent.setup();
    render(<TestCaseListGlobal selectedRelease="1" />);

    // Wait for the workspace to load
    await waitFor(() => {
      expect(screen.getByText('Login Case')).toBeInTheDocument();
      expect(screen.getByText('Payment Case')).toBeInTheDocument();
    });

    // Select the "Auth Suite" dropdown option
    const selectEl = document.querySelector('select');
    await user.selectOptions(selectEl, '1');

    // Verify only "Login Case" is displayed, and "Payment Case" is filtered out
    await waitFor(() => {
      expect(screen.getByText('Login Case')).toBeInTheDocument();
      expect(screen.queryByText('Payment Case')).not.toBeInTheDocument();
    });
  });
});
