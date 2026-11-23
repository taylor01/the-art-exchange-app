import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { searchDoc } from '../test/fixtures';

vi.mock('../api/client');
vi.mock('../config/features', () => ({ accountsEnabled: true }));
vi.mock('../store/authStore', () => ({ useAuthStore: vi.fn() }));

function renderHome() {
  return render(<BrowserRouter><Home /></BrowserRouter>);
}

describe('Home (accounts on)', () => {
  beforeEach(() => {
    client.get.mockResolvedValue({ data: searchDoc() });
  });

  it('leads with the headline', () => {
    useAuthStore.mockReturnValue({ user: null });
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/catalog\s*the wall/i);
  });

  it('invites guests to start a wall', () => {
    useAuthStore.mockReturnValue({ user: null });
    renderHome();
    expect(screen.getByRole('link', { name: /start your wall/i })).toHaveAttribute('href', '/join');
  });

  it('sends signed-in collectors to their wall', () => {
    useAuthStore.mockReturnValue({ user: { id: 1 } });
    renderHome();
    expect(screen.getByRole('link', { name: /go to my wall/i })).toHaveAttribute('href', '/wall');
  });

  it('shows recently added posters', async () => {
    useAuthStore.mockReturnValue({ user: null });
    renderHome();
    expect(await screen.findByText('Night One')).toBeInTheDocument();
    expect(client.get).toHaveBeenCalledWith('/posters/search', expect.objectContaining({ params: expect.objectContaining({ sort: '-created_at' }) }));
  });
});
