import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PosterDetail from './PosterDetail';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { posterDoc, recordingsDoc, searchDoc, setlistDoc, showDoc } from '../test/fixtures';

vi.mock('../api/client');
vi.mock('../config/features', () => ({ accountsEnabled: true }));
vi.mock('../store/authStore', () => ({ useAuthStore: vi.fn() }));

function routeGets({ copies = [] } = {}) {
  client.get.mockImplementation((url) => {
    if (url.startsWith('/posters/search')) return Promise.resolve({ data: searchDoc() });
    if (url.startsWith('/posters/')) return Promise.resolve({ data: posterDoc });
    if (url.endsWith('/setlist_songs')) return Promise.resolve({ data: setlistDoc });
    if (url.endsWith('/recordings')) return Promise.resolve({ data: recordingsDoc });
    if (url.endsWith('/bookmark')) return Promise.reject({ response: { status: 404 } });
    if (url.startsWith('/shows/')) return Promise.resolve({ data: showDoc });
    if (url === '/user_posters') return Promise.resolve({ data: { data: copies, included: [posterDoc.data] } });
    return Promise.reject(new Error(`unexpected ${url}`));
  });
}

function renderPoster() {
  return render(
    <MemoryRouter initialEntries={['/poster/moth-parade-red-rocks-2022']}>
      <Routes>
        <Route path="/poster/:id" element={<PosterDetail />} />
        <Route path="/signin" element={<p>Sign in page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PosterDetail', () => {
  beforeEach(() => {
    useAuthStore.mockReturnValue({ user: null });
    routeGets();
  });

  it('shows the poster, its print details and the setlist', async () => {
    renderPoster();
    expect(await screen.findByRole('heading', { level: 1, name: 'Moth Parade' })).toBeInTheDocument();
    expect(screen.getByText('Jen Ruiz', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByText('$40', { selector: 'dd' })).toBeInTheDocument();
    expect(await screen.findByText('Lantern Season')).toBeInTheDocument();
    expect(screen.getByText('E1')).toBeInTheDocument();
    expect(client.get).toHaveBeenCalledWith('/posters/moth-parade-red-rocks-2022', expect.objectContaining({ params: { include: 'band,venue,show,artists,series' } }));
  });

  it('shows the venue section', async () => {
    renderPoster();
    expect(await screen.findByRole('heading', { level: 2, name: 'Red Rocks' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /every poster from here/i })).toHaveAttribute('href', '/gallery?venue=9');
  });

  it('sends signed-out visitors to sign in when they add it to their wall', async () => {
    renderPoster();
    fireEvent.click(await screen.findByRole('button', { name: /put it on my wall/i }));
    expect(await screen.findByText('Sign in page')).toBeInTheDocument();
  });

  it('adds it to a signed-in collector\'s wall', async () => {
    useAuthStore.mockReturnValue({ user: { id: 1 } });
    client.post.mockResolvedValue({ data: { data: { id: '77', type: 'user_poster', attributes: { status: 'owned' } } } });
    renderPoster();
    fireEvent.click(await screen.findByRole('button', { name: /put it on my wall/i }));
    await waitFor(() => expect(client.post).toHaveBeenCalledWith('/user_posters', { user_poster: { poster_id: '123', status: 'owned' } }));
    expect(client.get).toHaveBeenCalledWith('/user_posters', { params: { per_page: 200, poster_id: '123' } });
  });

  it('shows the collector\'s copy when it is already on their wall', async () => {
    useAuthStore.mockReturnValue({ user: { id: 1 } });
    routeGets({
      copies: [{ id: '77', type: 'user_poster', attributes: { status: 'owned', condition: 'mint', edition_number: '88/200' }, relationships: { poster: { data: { id: '123', type: 'poster' } } } }],
    });
    renderPoster();
    expect(await screen.findByText('On your wall')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage your copy/i })).toHaveAttribute('href', '/wall/77');
  });

  it('says when a poster does not exist', async () => {
    client.get.mockRejectedValue({ response: { status: 404 } });
    renderPoster();
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn.t find that poster/i);
  });
});
