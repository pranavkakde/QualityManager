import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import AddTestCase from '../pages/AddTestCase';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ testsuiteid: '42' })
}));

vi.mock('axios');

describe('AddTestCase Component Spec', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input elements, textareas, and save buttons cleanly with accessibility labels', () => {
    render(<AddTestCase />);

    expect(screen.getByText('Create New Test Case')).toBeInTheDocument();
    expect(screen.getByLabelText(/Test Case Name/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i, { selector: 'textarea' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Prerequisites/i, { selector: 'textarea' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Version/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i, { selector: 'select' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Test Case/i })).toBeInTheDocument();
  });

  it('navigates back to cases list on cancel click', async () => {
    const user = userEvent.setup();
    render(<AddTestCase />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/suites/42/cases');
  });

  it('submits form details, runs double stage POST calls and redirects back on success', async () => {
    const user = userEvent.setup();
    axios.post = vi.fn()
      .mockResolvedValueOnce({ data: { success: true, data: { testcaseid: 101, name: 'Login Check' } } })
      .mockResolvedValueOnce({ data: { success: true } });

    render(<AddTestCase />);

    const nameInput = screen.getByLabelText(/Test Case Name/i, { selector: 'input' });
    const descInput = screen.getByLabelText(/Description/i, { selector: 'textarea' });
    const prereqInput = screen.getByLabelText(/Prerequisites/i, { selector: 'textarea' });
    const versionInput = screen.getByLabelText(/Version/i, { selector: 'input' });
    const statusSelect = screen.getByLabelText(/Status/i, { selector: 'select' });
    const saveButton = screen.getByRole('button', { name: /Save Test Case/i });

    await user.type(nameInput, 'Login Check');
    await user.type(descInput, 'Simple check');
    await user.type(prereqInput, 'User created');
    await user.clear(versionInput);
    await user.type(versionInput, 'v3');
    await user.selectOptions(statusSelect, '3'); // Select Passed option

    await user.click(saveButton);

    expect(axios.post).toHaveBeenNthCalledWith(1, '/api/testcase', {
      name: 'Login Check',
      description: 'Simple check',
      prerequisite: 'User created',
      versionid: 'v3',
      statusid: 3,
      author: 2
    });

    expect(axios.post).toHaveBeenNthCalledWith(2, '/api/testsuite/42/testcases/101');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/suites/42/cases');
    });
  });

  it('displays error message if first stage post fails', async () => {
    const user = userEvent.setup();
    axios.post = vi.fn().mockRejectedValueOnce({
      response: { data: { error: 'Test Case name is taken' } }
    });

    render(<AddTestCase />);

    const nameInput = screen.getByLabelText(/Test Case Name/i, { selector: 'input' });
    const saveButton = screen.getByRole('button', { name: /Save Test Case/i });

    await user.type(nameInput, 'Duplicate Check');
    await user.click(saveButton);

    expect(axios.post).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.getByText('Test Case name is taken')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
