import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Deals from './Deals';
import client from '../../api/client';
import { posterResource, included } from '../../test/fixtures';

vi.mock('../../api/client');

const trade = (id, attrs) => ({
  id, type: 'trade',
  attributes: {
    status: 'pending_confirmation', price_dollars: 180, edition_number: '112/200', role: 'buyer', counterpart_handle: 'gorgeous_g',
    awaiting: 'buyer', allowed_actions: ['confirm', 'cancel'], conversation_id: '6', confirmed_at: null, ...attrs,
  },
  relationships: { poster: { data: { id: '123', type: 'poster' } } },
});

function route(trades) {
  client.get.mockImplementation((url) => {
    if (url === '/trades') return Promise.resolve({ data: { data: trades, included: [posterResource, ...included] } });
    return Promise.reject(new Error(url));
  });
}

const renderDeals = () => render(<MemoryRouter><Deals /></MemoryRouter>);

describe('Deals', () => {
  it('points sales waiting on me to their conversation', async () => {
    route([trade('9', {})]);
    renderDeals();
    expect(await screen.findByText('@gorgeous_g marked it sold to you for $180')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Confirm in Messages' })).toHaveAttribute('href', '/messages/6');
  });

  it('lists sales waiting on the other collector and completed trades', async () => {
    route([
      trade('9', { role: 'seller', counterpart_handle: 'moth_fan', awaiting: 'buyer', allowed_actions: ['cancel'], conversation_id: '7', price_dollars: 230 }),
      trade('10', { status: 'confirmed', role: 'seller', counterpart_handle: 'ninethirty', awaiting: null, allowed_actions: [], conversation_id: '8', price_dollars: 205, confirmed_at: '2026-10-28T12:00:00Z' }),
    ]);
    renderDeals();
    expect(await screen.findByText('Waiting for @moth_fan to confirm $230')).toBeInTheDocument();
    expect(screen.getByText(/Sold to @ninethirty/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Messages' })).toHaveAttribute('href', '/messages');
  });

  it('says when there are no trades yet', async () => {
    route([]);
    renderDeals();
    expect(await screen.findByText('No trades yet')).toBeInTheDocument();
  });
});
