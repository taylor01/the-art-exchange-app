import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';

// Public browsing (the default build): accounts are off.
vi.mock('../config/features', () => ({ accountsEnabled: false }));

vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('public browsing mode', () => {
  it('offers the gallery instead of sign-up on the home page', () => {
    useAuthStore.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /browse the gallery/i })).toHaveAttribute('href', '/gallery');
    expect(screen.queryByText(/start collecting free/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
  });

  it('shows no sign-in or sign-up links in the navigation', () => {
    useAuthStore.mockReturnValue({ user: null, logout: vi.fn() });

    render(
      <BrowserRouter>
        <Layout>
          <p>content</p>
        </Layout>
      </BrowserRouter>
    );

    // The links sit in the collapsed mobile menu, which counts as hidden.
    expect(screen.getByRole('link', { name: /gallery/i, hidden: true })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign in/i, hidden: true })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign up/i, hidden: true })).not.toBeInTheDocument();
  });
});
