import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Deals from './Deals';
import client from '../../api/client';
import { posterResource, included } from '../../test/fixtures';

vi.mock('../../api/client');

const posterRel = { poster: { data: { id: '123', type: 'poster' } } };

const inquiry = (attrs) => ({
  id: '5', type: 'inquiry',
  attributes: {
    status: 'pending', role: 'seller', counterpart_handle: 'moth_fan', offer_dollars: 180, message: 'Still have it?',
    copy: { id: '91', edition_number: '112/200', condition: 'near_mint', asking_price_dollars: 195, handoff: 'ships' },
    allowed_transitions: ['accepted', 'declined'], trade_id: null, ...attrs,
  },
  relationships: posterRel,
});

const trade = (attrs) => ({
  id: '9', type: 'trade',
  attributes: {
    status: 'pending_confirmation', price_dollars: 180, edition_number: '112/200', role: 'buyer', counterpart_handle: 'gorgeous_g',
    awaiting: 'buyer', allowed_actions: ['confirm', 'cancel'], inquiry_id: '6', ...attrs,
  },
  relationships: posterRel,
});

function route({ inquiries = [], trades = [] } = {}) {
  client.get.mockImplementation((url) => {
    if (url === '/inquiries') return Promise.resolve({ data: { data: inquiries, included: [posterResource, ...included] } });
    if (url === '/trades') return Promise.resolve({ data: { data: trades, included: [posterResource, ...included] } });
    return Promise.reject(new Error(url));
  });
}

const renderDeals = () => render(<MemoryRouter><Deals /></MemoryRouter>);

describe('Deals', () => {
  beforeEach(() => {
    client.patch.mockResolvedValue({ data: { data: inquiry({ status: 'accepted', allowed_transitions: ['cancelled'] }) } });
    client.post.mockResolvedValue({ data: { data: trade({}) } });
  });

  it('shows a received inquiry with the buttons the API allows', async () => {
    route({ inquiries: [inquiry({})] });
    renderDeals();
    expect(await screen.findByText(/offering \$180/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Withdraw' })).not.toBeInTheDocument();
  });

  it('accepts an inquiry', async () => {
    route({ inquiries: [inquiry({})] });
    renderDeals();
    fireEvent.click(await screen.findByRole('button', { name: 'Accept' }));
    await waitFor(() => expect(client.patch).toHaveBeenCalledWith('/inquiries/5', { inquiry: { status: 'accepted' } }));
  });

  it('shows the email once accepted and records the trade at the offered price', async () => {
    route({ inquiries: [inquiry({ status: 'accepted', allowed_transitions: ['cancelled'], counterpart_email: 'fan@example.com' })] });
    renderDeals();
    expect(await screen.findByRole('link', { name: 'fan@example.com' })).toHaveAttribute('href', 'mailto:fan@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Record the trade' }));
    expect(screen.getByLabelText('Price paid')).toHaveValue('180');
    fireEvent.click(screen.getByRole('radio', { name: /remove it from my wall/i }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Record the trade' }).at(-1));
    await waitFor(() => expect(client.post).toHaveBeenCalledWith('/trades', { trade: { inquiry_id: '5', price_dollars: '180', move_copy: true, remove_copy: true } }));
  });

  it('confirms a trade waiting on me by sending the recorded price back', async () => {
    route({ trades: [trade({})] });
    client.patch.mockResolvedValue({ data: { data: trade({ status: 'confirmed', allowed_actions: [] }) } });
    renderDeals();
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm $180' }));
    await waitFor(() => expect(client.patch).toHaveBeenCalledWith('/trades/9/confirm', { trade: { price_dollars: 180, move_copy: true, remove_copy: false } }));
  });

  it('offers only Cancel the trade while a recorded trade waits on the other side', async () => {
    route({
      inquiries: [inquiry({ status: 'accepted', allowed_transitions: ['cancelled'], counterpart_email: 'fan@example.com', trade_id: '9' })],
      trades: [trade({ role: 'seller', counterpart_handle: 'moth_fan', allowed_actions: ['cancel'], inquiry_id: '5' })],
    });
    renderDeals();
    expect(await screen.findByText(/Waiting for @moth_fan to confirm/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel the trade' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Call it off' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Record the trade' })).not.toBeInTheDocument();
  });

  it('explains why a closed inquiry closed', async () => {
    route({ inquiries: [inquiry({ status: 'cancelled', closed_reason: 'copy_sold', allowed_transitions: [], role: 'buyer' })] });
    renderDeals();
    expect(await screen.findByText('This copy sold.')).toBeInTheDocument();
  });
});
