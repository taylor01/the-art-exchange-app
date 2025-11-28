import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import { useAuthStore } from '../store/authStore';

// Mock the auth store
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('Home Page', () => {
  it('renders hero section with main heading', () => {
    useAuthStore.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Art Posters')).toBeInTheDocument();
    expect(screen.getByText("You'll Love")).toBeInTheDocument();
  });

  it('shows guest CTAs when user is not logged in', () => {
    useAuthStore.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Start Collecting Free')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText(/of collectors worldwide/i)).toBeInTheDocument();
  });

  it('shows authenticated CTAs when user is logged in', () => {
    useAuthStore.mockReturnValue({
      user: { id: 1, email: 'test@example.com' },
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('View My Profile')).toBeInTheDocument();
    expect(screen.getByText('Browse Collection')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    useAuthStore.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Track Collections')).toBeInTheDocument();
    expect(screen.getByText('Discover Art')).toBeInTheDocument();
    expect(screen.getByText('Connect & Trade')).toBeInTheDocument();
  });

  it('renders features section heading', () => {
    useAuthStore.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Why Collectors Choose Us')).toBeInTheDocument();
  });
});
