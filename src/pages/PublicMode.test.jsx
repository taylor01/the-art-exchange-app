import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import Layout from '../components/Layout';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { searchDoc } from '../test/fixtures';

// Public browsing (the default build): accounts are off.
vi.mock('../config/features', () => ({ accountsEnabled: false }));
vi.mock('../api/client');
vi.mock('../store/authStore', () => ({ useAuthStore: vi.fn() }));

describe('public browsing mode', () => {
  beforeEach(() => {
    client.get.mockResolvedValue({ data: searchDoc() });
  });

  it('offers the archive instead of joining on the home page', () => {
    useAuthStore.mockReturnValue({ user: null });
    render(<BrowserRouter><Home /></BrowserRouter>);
    expect(screen.getByRole('link', { name: /browse the archive/i })).toHaveAttribute('href', '/gallery');
    expect(screen.queryByRole('link', { name: /start your wall/i })).not.toBeInTheDocument();
  });

  it('shows no sign-in or join links in the header', () => {
    useAuthStore.mockReturnValue({ user: null, logout: vi.fn() });
    render(<BrowserRouter><Layout><p>content</p></Layout></BrowserRouter>);
    expect(screen.getByRole('link', { name: 'Archive' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /join/i })).not.toBeInTheDocument();
  });
});
