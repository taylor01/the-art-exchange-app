import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Messages from './Messages';
import client from '../../api/client';
import { posterResource, included } from '../../test/fixtures';

vi.mock('../../api/client');

const posterRel = { poster: { data: { id: '123', type: 'poster' } } };

const conversation = (attrs = {}) => ({
  id: '5',
  type: 'conversation',
  attributes: {
    status: 'open', closed_reason: null, role: 'seller', counterpart_handle: 'moth_fan', unread: true,
    last_message: { body: 'Would you do $220 shipped?', from_me: false, created_at: '2026-11-23T21:21:00Z' },
    last_message_at: '2026-11-23T21:21:00Z', created_at: '2026-11-23T21:12:00Z',
    copy: { id: '91', edition_number: 'AP 12/50', condition: 'near_mint', asking_price_dollars: 240, handoff: 'ships' },
    trade: null, allowed_transitions: ['closed'], ...attrs,
  },
  relationships: posterRel,
});

const message = (id, body, fromMe, extra = {}) => ({
  id, type: 'message',
  attributes: { body, created_at: `2026-11-23T21:${id}:00Z`, from_me: fromMe, sender_role: fromMe ? 'seller' : 'buyer', ...extra },
});

const thread = [
  message('10', 'Hey, is this one still available?', false),
  message('11', 'Yep. Near mint, never framed.', true),
  message('12', 'Would you do $220 shipped?', false),
];

function route({ convo = conversation(), messages = thread } = {}) {
  client.get.mockImplementation((url) => {
    if (url === '/conversations') return Promise.resolve({ data: { data: [convo], included: [posterResource, ...included], meta: { unread_count: 1 } } });
    if (url === '/conversations/5') return Promise.resolve({ data: { data: convo, included: [posterResource, ...included] } });
    if (url === '/conversations/5/messages') return Promise.resolve({ data: { data: messages, meta: { has_earlier: false } } });
    return Promise.reject(new Error(`unexpected ${url}`));
  });
}

function renderAt(path = '/messages/5') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<Messages />} />
      </Routes>
    </MemoryRouter>
  );
}

const threadBody = () => screen.getByRole('list', { name: 'Conversation with @moth_fan' });

describe('Messages', () => {
  beforeEach(() => {
    client.patch.mockResolvedValue({ data: {} });
  });

  it('lists conversations, opens the thread and marks it read up to the newest message shown', async () => {
    route();
    renderAt();
    expect(await screen.findByText('Yep. Near mint, never framed.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /@moth_fan.*would you do \$220/i })).toHaveAttribute('href', '/messages/5');
    await waitFor(() => expect(client.patch).toHaveBeenCalledWith('/conversations/5/read', { message_id: '12' }));
  });

  it('asks you to pick a conversation when none is open', async () => {
    route();
    renderAt('/messages');
    expect(await screen.findByText('Pick a conversation to read it.')).toBeInTheDocument();
  });

  it('sends a message and shows it in the thread', async () => {
    route();
    client.post.mockResolvedValue({ data: { data: message('13', 'Meet me at $230 shipped', true) } });
    renderAt();
    const box = await screen.findByLabelText('Message @moth_fan');
    fireEvent.change(box, { target: { value: 'Meet me at $230 shipped' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(client.post).toHaveBeenCalledWith('/conversations/5/messages', { message: { body: 'Meet me at $230 shipped' } }));
    expect(await within(threadBody()).findByText('Meet me at $230 shipped')).toBeInTheDocument();
    expect(box).toHaveValue('');
  });

  it('lets the seller mark it sold at the agreed price', async () => {
    route();
    client.post.mockResolvedValue({ data: { data: { id: '9', type: 'trade', attributes: { status: 'pending_confirmation', price_dollars: 230 } } } });
    renderAt();
    fireEvent.click(await screen.findByRole('button', { name: 'Mark sold to @moth_fan' }));
    const price = screen.getByLabelText('Sold for');
    expect(price).toHaveValue('240');
    fireEvent.change(price, { target: { value: '$230' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send to @moth_fan to confirm' }));
    await waitFor(() => expect(client.post).toHaveBeenCalledWith('/trades', {
      trade: { conversation_id: '5', price_dollars: '230', move_copy: true, remove_copy: false },
    }));
  });

  it('lets the buyer confirm the sale in the thread', async () => {
    route({
      convo: conversation({
        role: 'buyer', counterpart_handle: 'moth_fan', allowed_transitions: ['closed'],
        trade: { id: '9', status: 'pending_confirmation', price_dollars: 175, allowed_actions: ['confirm', 'cancel'], recorded_by_me: false, created_at: '2026-11-23T21:30:00Z' },
      }),
    });
    client.patch.mockResolvedValue({ data: { data: { id: '9', type: 'trade', attributes: { status: 'confirmed', price_dollars: 175 } } } });
    renderAt();
    expect(await screen.findByText('@moth_fan marked this sold to you')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark sold/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm $175' }));
    await waitFor(() => expect(client.patch).toHaveBeenCalledWith('/trades/9/confirm', {
      trade: { price_dollars: 175, move_copy: true, remove_copy: false },
    }));
  });

  it('shows the seller that the buyer still has to confirm', async () => {
    route({
      convo: conversation({
        trade: { id: '9', status: 'pending_confirmation', price_dollars: 230, allowed_actions: ['cancel'], recorded_by_me: true, created_at: '2026-11-23T21:30:00Z' },
      }),
    });
    renderAt();
    expect(await screen.findByText('Waiting for @moth_fan to confirm')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel the trade' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark sold/i })).not.toBeInTheDocument();
  });

  it('locks a completed conversation and keeps it as the record', async () => {
    route({
      convo: conversation({
        status: 'completed', unread: false, allowed_transitions: [],
        trade: { id: '9', status: 'confirmed', price_dollars: 230, allowed_actions: [], recorded_by_me: true, created_at: '2026-11-23T21:30:00Z' },
      }),
    });
    renderAt();
    expect(await screen.findByText(/Sold to @moth_fan for \$230\./)).toBeInTheDocument();
    expect(screen.queryByLabelText('Message @moth_fan')).not.toBeInTheDocument();
    expect(screen.getByText('Trade confirmed')).toBeInTheDocument();
  });

  it('says why a closed conversation closed', async () => {
    route({ convo: conversation({ status: 'closed', closed_reason: 'copy_sold', role: 'buyer', unread: false, allowed_transitions: [] }) });
    renderAt();
    expect(await screen.findByText(/This copy sold to someone else\./)).toBeInTheDocument();
  });

  it('shows a deleted account\'s messages without their text', async () => {
    route({ messages: [message('10', '', false, { sender_role: null })] });
    renderAt();
    expect(await within(await screen.findByRole('list', { name: 'Conversation with @moth_fan' })).findByText('Deleted account')).toBeInTheDocument();
  });
});
