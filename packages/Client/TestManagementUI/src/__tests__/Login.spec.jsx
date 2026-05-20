import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import Login from '../pages/Login';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('axios');

describe('Login Component Spec', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login fields with prefilled demo credentials', () => {
    render(<Login onLogin={vi.fn()} />);

    expect(screen.getByText('QualityManager')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();

    const usernameInput = screen.getByDisplayValue('admin');
    const passwordInput = screen.getByDisplayValue('admin123');

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('submits credentials successfully and calls onLogin and navigate', async () => {
    const mockOnLogin = vi.fn();
    const user = userEvent.setup();

    axios.post = vi.fn().mockResolvedValueOnce({ data: { token: 'mock-token', username: 'admin' } });

    render(<Login onLogin={mockOnLogin} />);

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitButton);

    expect(axios.post).toHaveBeenCalledWith('/api/user/login', {
      username: 'admin',
      password: 'admin123',
    });
    expect(mockOnLogin).toHaveBeenCalledWith(true, { token: 'mock-token', username: 'admin' });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows alert error message on connection or credential failure', async () => {
    const mockOnLogin = vi.fn();
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    axios.post = vi.fn().mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    render(<Login onLogin={mockOnLogin} />);

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitButton);

    expect(axios.post).toHaveBeenCalled();
    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith('Login failed: Invalid credentials');

    alertMock.mockRestore();
  });
});
