import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import PosterDetail from './PosterDetail';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { historyDoc, included, listingsDoc, posterDoc, posterResource, recordingsDoc, searchDoc, setlistDoc, showDoc } from '../test/fixtures';

vi.mock('../api/client');
vi.mock('../config/features', () => ({ accountsEnabled: true }));
vi.mock('../store/authStore', () => ({ useAuthStore: vi.fn() }));

function routeGets({ copies = [] } = {}) {
  client.get.mockImplementation((url) => {
    if (url.startsWith('/posters/search')) return Promise.resolve({ data: searchDoc() });
    if (url.endsWith('/listings')) return Promise.resolve({ data: listingsDoc });
    if (url.endsWith('/price_history')) return Promise.resolve({ data: historyDoc });
    if (url.startsWith('/posters/')) return Promise.resolve({ data: posterDoc });
    if (url.endsWith('/setlist_songs')) return Promise.resolve({ data: setlistDoc });
    if (url.endsWith('/recordings')) return Promise.resolve({ data: recordingsDoc });
    if (url.endsWith('/bookmark')) return Promise.reject({ response: { status: 404 } });
    if (url.startsWith('/shows/')) return Promise.resolve({ data: showDoc });
    if (url === '/user_posters') return Promise.resolve({ data: { data: copies, included: [posterDoc.data] } });
    return Promise.reject(new Error(`unexpected ${url}`));
  });
}

function CopyStub() {
  const { id } = useParams();
  return <p>Copy page {id}</p>;
}

function MessagesStub() {
  const { id } = useParams();
  return <p>Conversation {id}</p>;
}

function renderPoster() {
  return render(
    <MemoryRouter initialEntries={['/poster/moth-parade-red-rocks-2022']}>
      <Routes>
        <Route path="/poster/:id" element={<PosterDetail />} />
        <Route path="/signin" element={<p>Sign in page</p>} />
        <Route path="/messages/:id" element={<MessagesStub />} />
        <Route path="/wall/:id" element={<CopyStub />} />
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

  it('lists every copy on the collector\'s wall and lets them add another', async () => {
    useAuthStore.mockReturnValue({ user: { id: 1 } });
    const copy = (id, attrs) => ({ id, type: 'user_poster', attributes: { status: 'owned', ...attrs }, relationships: { poster: { data: { id: '123', type: 'poster' } } } });
    routeGets({
      copies: [
        copy('77', { condition: 'mint', edition_number: '88/200' }),
        copy('78', { condition: 'near_mint', edition_number: 'AP 2/20', for_sale: true, asking_price_dollars: 240 }),
      ],
    });
    client.post.mockResolvedValue({ data: { data: copy('79', {}) } });
    renderPoster();
    const yours = await screen.findByRole('region', { name: 'Your copies' });
    expect(yours).toHaveTextContent('2 copies');
    expect(yours).toHaveTextContent('88/200');
    expect(yours).toHaveTextContent('AP 2/20');
    expect(yours).toHaveTextContent('For sale $240');
    const manage = screen.getAllByRole('link', { name: /manage/i });
    expect(manage.map((a) => a.getAttribute('href'))).toEqual(['/wall/77', '/wall/78']);
    expect(screen.queryByRole('button', { name: /put it on my wall/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add another copy' }));
    await waitFor(() => expect(client.post).toHaveBeenCalledWith('/user_posters', { user_poster: { poster_id: '123', status: 'owned' } }));
    expect(await screen.findByText('Copy page 79')).toBeInTheDocument();
  });

  it('shows the whole series in show order, with what the collector has', async () => {
    useAuthStore.mockReturnValue({ user: { id: 1 } });
    const piece = (id, venue) => ({
      ...posterResource, id,
      attributes: { ...posterResource.attributes, slug: `piece-${id}`, name: `Piece ${id}` },
      relationships: { ...posterResource.relationships, venue: { data: { id: venue, type: 'venue' } }, show: { data: { id: `s${id}`, type: 'show' } } },
    });
    const pieces = [piece('125', '9'), piece('123', '9'), piece('124', '9')];
    const shows = pieces.map((p, i) => ({ id: `s${p.id}`, type: 'show', attributes: { show_date: ['2022-08-19', '2022-08-13', '2022-08-14'][i] } }));
    const inSeries = { ...posterResource, relationships: { ...posterResource.relationships, series: { data: [{ id: '4', type: 'series' }] } } };
    const seriesIncluded = [...included, { id: '4', type: 'series', attributes: { name: 'Chess Series' } }];
    routeGets({ copies: [{ id: '90', type: 'user_poster', attributes: { status: 'wanted' }, relationships: { poster: { data: { id: '125', type: 'poster' } } } }] });
    const base = client.get.getMockImplementation();
    client.get.mockImplementation((url, config) => {
      if (url === '/posters/search' && config?.params?.series_ids) return Promise.resolve({ data: { data: pieces, included: [...included, ...shows], meta: {} } });
      if (url === '/posters/moth-parade-red-rocks-2022') return Promise.resolve({ data: { data: inSeries, included: seriesIncluded } });
      return base(url, config);
    });
    renderPoster();
    const section = await screen.findByRole('region', { name: 'Chess Series' });
    expect(section).toHaveTextContent('Part of a series · 3 posters');
    const links = within(section).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/poster/piece-123', '/poster/piece-124', '/poster/piece-125']);
    expect(links[0]).toHaveAttribute('aria-current', 'page');
    expect(within(links[2]).getByText('Hunting')).toBeInTheDocument();
    expect(client.get).toHaveBeenCalledWith('/posters/search', { params: { include: 'band,venue,show', series_ids: ['4'], per_page: 100 } });
  });

  it('shows price history and copies for sale', async () => {
    renderPoster();
    expect(await screen.findByText('Last sale')).toBeInTheDocument();
    expect(screen.getAllByText('$185').length).toBeGreaterThan(0);
    expect(screen.getByText('4.6×')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '@gorgeous_g' })).toHaveAttribute('href', '/c/gorgeous_g');
  });

  it('opens a conversation with the seller from a copy for sale', async () => {
    useAuthStore.mockReturnValue({ user: { id: 1, handle: 'robin' } });
    client.post.mockResolvedValue({ data: { data: { id: '5', type: 'conversation', attributes: { status: 'open', role: 'buyer' } } } });
    renderPoster();
    fireEvent.click(await screen.findByRole('button', { name: 'Message @gorgeous_g' }));
    await waitFor(() => expect(client.post).toHaveBeenCalledWith('/user_posters/91/conversations', { conversation: { message: null, offer_dollars: null } }));
    expect(await screen.findByText('Conversation 5')).toBeInTheDocument();
  });

  it('sends a signed-out visitor to sign in before messaging', async () => {
    useAuthStore.mockReturnValue({ user: null });
    renderPoster();
    expect(await screen.findByRole('link', { name: 'Message @gorgeous_g' })).toHaveAttribute('href', '/signin');
  });

  it('says when a poster does not exist', async () => {
    client.get.mockRejectedValue({ response: { status: 404 } });
    renderPoster();
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn.t find that poster/i);
  });
});
