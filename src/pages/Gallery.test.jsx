import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Gallery from './Gallery';
import client from '../api/client';
import { searchDoc } from '../test/fixtures';

vi.mock('../api/client');

function Where() {
  const location = useLocation();
  return <output data-testid="where">{location.search}</output>;
}

function renderAt(url = '/gallery') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/gallery" element={<><Gallery /><Where /></>} />
      </Routes>
    </MemoryRouter>
  );
}

const lastParams = () => client.get.mock.calls.at(-1)[1].params;

describe('Gallery', () => {
  beforeEach(() => {
    client.get.mockResolvedValue({ data: searchDoc() });
  });

  it('loads posters from the search endpoint with their band, venue and artists', async () => {
    renderAt();
    expect(await screen.findByText('Night One')).toBeInTheDocument();
    expect(client.get).toHaveBeenCalledWith('/posters/search', expect.any(Object));
    expect(lastParams()).toMatchObject({ include: 'band,venue,artists', page: 1, per_page: 40 });
    expect(screen.getByText('1 poster')).toBeInTheDocument();
  });

  it('reads search, filters, sort and page from the URL', async () => {
    renderAt('/gallery?q=rocks&artist=3&venue=9&year=2022&sort=-year&page=2');
    await screen.findByText('Night One');
    expect(lastParams()).toMatchObject({ query: 'rocks', artist_ids: ['3'], venue_id: '9', year: '2022', sort: '-year', page: 2 });
  });

  it('puts a new search in the URL and goes back to page 1', async () => {
    renderAt('/gallery?page=3');
    await screen.findByText('Night One');
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'moth' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('?q=moth'));
    expect(lastParams()).toMatchObject({ query: 'moth', page: 1 });
  });

  it('filters by a facet', async () => {
    renderAt();
    await screen.findByText('Night One');
    fireEvent.change(screen.getByLabelText('Venue'), { target: { value: '9' } });
    await waitFor(() => expect(lastParams()).toMatchObject({ venue_id: '9' }));
  });

  it('says so when nothing matches', async () => {
    client.get.mockResolvedValue({ data: searchDoc([]) });
    renderAt('/gallery?q=zzz');
    expect(await screen.findByText(/nothing matches/i)).toBeInTheDocument();
  });

  it('shows an error with a retry', async () => {
    client.get.mockRejectedValue(new Error('down'));
    renderAt();
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn.t load the archive/i);
    client.get.mockResolvedValue({ data: searchDoc() });
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Night One')).toBeInTheDocument();
  });
});
