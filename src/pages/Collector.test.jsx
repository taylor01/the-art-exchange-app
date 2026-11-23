import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Collector from './Collector';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { posterResource, included } from '../test/fixtures';

vi.mock('../api/client');
vi.mock('../store/authStore', () => ({ useAuthStore: vi.fn() }));

function Where() {
  return <output data-testid="where">{useLocation().pathname}</output>;
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/c/:handle" element={<><Collector /><Where /></>} />
      </Routes>
    </MemoryRouter>
  );
}

const collectorDoc = (attrs) => ({ data: { data: { id: 'moth_fan', type: 'collector', attributes: { handle: 'moth_fan', display_name: 'Robin', location: 'Durham, NC', ...attrs } } } });
const listDoc = { data: {
  data: [{ id: '77', type: 'collector_poster', attributes: { edition_number: '88/200', condition: 'mint' }, relationships: { poster: { data: { id: '123', type: 'poster' } } } }],
  included: [posterResource, ...included],
} };

describe('Collector', () => {
  beforeEach(() => {
    useAuthStore.mockReturnValue({ user: null });
  });

  it('shows only the public list, with no tabs', async () => {
    client.get.mockImplementation((url) => Promise.resolve(url.endsWith('/wanted') ? listDoc : collectorDoc({ public_lists: ['wanted'], wanted_count: 1 })));
    renderAt('/c/moth_fan');
    expect(await screen.findByRole('heading', { level: 1, name: '@moth_fan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Hunting' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(await screen.findByText('Night One')).toBeInTheDocument();
    expect(client.get).not.toHaveBeenCalledWith(expect.stringMatching(/for_sale$/), expect.anything());
  });

  it('replaces an old handle in the URL with the current one', async () => {
    client.get.mockImplementation((url) => Promise.resolve(url.endsWith('/wanted') ? listDoc : collectorDoc({ public_lists: ['wanted'] })));
    renderAt('/c/old_name');
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/c/moth_fan'));
  });

  it('gives one message for a missing or private collector', async () => {
    client.get.mockRejectedValue({ response: { status: 404 } });
    renderAt('/c/nobody');
    expect(await screen.findByText(/nothing to see here/i)).toBeInTheDocument();
  });
});
