import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import AddTestSuite from '../pages/AddTestSuite';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('axios');

describe('AddTestSuite Component Spec', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the create test suite form with inputs and disabled release id display', () => {
    render(<AddTestSuite selectedRelease={12} />);

    expect(screen.getByText('Create New Test Suite')).toBeInTheDocument();
    expect(screen.getByLabelText(/Suite Name/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i, { selector: 'textarea' })).toBeInTheDocument();
    
    const releaseIdInput = screen.getByDisplayValue('12');
    expect(releaseIdInput).toBeInTheDocument();
    expect(releaseIdInput).toBeDisabled();

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Suite/i })).toBeInTheDocument();
  });

  it('navigates back to suites on cancel click', async () => {
    const user = userEvent.setup();
    render(<AddTestSuite selectedRelease={12} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/suites');
  });

  it('submits name, description, statusid, and selected release ID successfully', async () => {
    const user = userEvent.setup();
    axios.post = vi.fn().mockResolvedValueOnce({ data: { success: true } });

    render(<AddTestSuite selectedRelease={12} />);

    const nameInput = screen.getByLabelText(/Suite Name/i, { selector: 'input' });
    const descInput = screen.getByLabelText(/Description/i, { selector: 'textarea' });
    const submitButton = screen.getByRole('button', { name: /Add Suite/i });

    await user.type(nameInput, 'Checkout Integration Flow');
    await user.type(descInput, 'Verifies payment pathways');
    await user.click(submitButton);

    expect(axios.post).toHaveBeenCalledWith('/api/testsuite/testsuite', {
      name: 'Checkout Integration Flow',
      description: 'Verifies payment pathways',
      releaseid: 12,
      statusid: 1
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/suites');
    });
  });

  it('alerts error on API failure', async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    axios.post = vi.fn().mockRejectedValueOnce({
      response: { data: { error: 'Validation failed' } }
    });

    render(<AddTestSuite selectedRelease={12} />);

    const nameInput = screen.getByLabelText(/Suite Name/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /Add Suite/i });

    await user.type(nameInput, 'Failed Suite');
    await user.click(submitButton);

    expect(axios.post).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith('Failed to create test suite: Validation failed');

    alertMock.mockRestore();
  });
});
