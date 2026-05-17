import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import TestCaseList from '../pages/TestCaseList';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ testsuiteid: '42' })
}));

vi.mock('axios');

describe('TestCaseList Component Spec', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spin indicator initially', () => {
    axios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<TestCaseList />);
    expect(screen.getByClassName ? screen.getByClassName('animate-spin') : document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state if no test cases are associated', async () => {
    axios.get = vi.fn()
      .mockResolvedValueOnce({ data: { testsuiteid: 42, name: 'Billing Suite', description: 'Checks stripe integrations' } })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(<TestCaseList />);

    await waitFor(() => {
      expect(screen.getByText('Billing Suite')).toBeInTheDocument();
      expect(screen.getByText('Checks stripe integrations')).toBeInTheDocument();
      expect(screen.getByText('No Test Cases Yet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create First Test Case/i })).toBeInTheDocument();
    });
  });

  it('renders list of test cases in a table successfully with status badges and author name mapped', async () => {
    axios.get = vi.fn()
      .mockResolvedValueOnce({ data: { testsuiteid: 42, name: 'Billing Suite', description: 'Checks stripe integrations' } })
      .mockResolvedValueOnce({
        data: [
          {
            testcaseid: 1,
            name: 'Process Payment Success',
            description: 'Ensure charges map cleanly',
            prerequisite: 'Valid card available',
            versionid: 'v1',
            statusid: 3,
            author: 2
          },
          {
            testcaseid: 2,
            name: 'Process Payment Decline',
            description: 'Ensure correct codes propagated',
            prerequisite: 'Declined card available',
            versionid: 'v2',
            statusid: 4,
            author: 2
          }
        ]
      })
      .mockResolvedValueOnce({
        data: [
          { UserId: 2, UserName: 'pranav' }
        ]
      });

    render(<TestCaseList />);

    await waitFor(() => {
      // Check table headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Prerequisites')).toBeInTheDocument();
      expect(screen.getByText('Version')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Author')).toBeInTheDocument();

      // Check test case details
      expect(screen.getByText('Process Payment Success')).toBeInTheDocument();
      expect(screen.getByText('Ensure charges map cleanly')).toBeInTheDocument();
      expect(screen.getByText('Passed')).toBeInTheDocument();
      
      expect(screen.getByText('Process Payment Decline')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();

      // Check author mapping
      expect(screen.getAllByText('pranav').length).toBeGreaterThan(0);
    });
  });

  it('navigates back to suites on back button click', async () => {
    const user = userEvent.setup();
    axios.get = vi.fn()
      .mockResolvedValueOnce({ data: { testsuiteid: 42, name: 'Billing Suite' } })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(<TestCaseList />);

    await waitFor(async () => {
      const backBtn = screen.getByRole('button', { name: /Back to Test Suites/i });
      await user.click(backBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/suites');
    });
  });

  it('navigates to add case view on add button click', async () => {
    const user = userEvent.setup();
    axios.get = vi.fn()
      .mockResolvedValueOnce({ data: { testsuiteid: 42, name: 'Billing Suite' } })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(<TestCaseList />);

    await waitFor(async () => {
      const addBtn = screen.getByRole('button', { name: /Add Test Case/i });
      await user.click(addBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/suites/42/cases/add');
    });
  });
});
