// Buying and selling: listings, price history, conversations and trades (API #80, #82, #91).
import client from './client';
import { indexIncluded, related } from './jsonapi';
import { toPoster } from './catalog';

// GET /posters/:id/listings (no auth): for-sale copies from public For sale lists
export async function getListings(posterId) {
  const { data } = await client.get(`/posters/${encodeURIComponent(posterId)}/listings`, { params: { per_page: 20 } });
  return {
    listings: (data.data || []).map((r) => ({
      id: r.id,
      editionNumber: r.attributes.edition_number,
      condition: r.attributes.condition,
      handoff: r.attributes.handoff,
      askingPrice: r.attributes.asking_price_dollars ?? null,
      sellerHandle: r.attributes.seller_handle,
      listedAt: r.attributes.listed_at,
    })),
    total: data.meta?.total_count ?? (data.data || []).length,
  };
}

// GET /posters/:id/price_history (no auth): counted sales only, no identities
export async function getPriceHistory(posterId) {
  const { data } = await client.get(`/posters/${encodeURIComponent(posterId)}/price_history`);
  const a = data.data?.attributes || {};
  const s = a.summary || {};
  return {
    points: (a.points || []).map((p) => ({ date: p.date, price: p.price_dollars, edition: p.edition_label })),
    summary: {
      lastSale: s.last_sale ? { date: s.last_sale.date, price: s.last_sale.price_dollars } : null,
      median12m: s.median_12m ?? null,
      low12m: s.low_12m ?? null,
      high12m: s.high_12m ?? null,
      count12m: s.count_12m ?? 0,
      countAll: s.count_all ?? 0,
      releasePrice: s.release_price_dollars ?? null,
    },
  };
}

// Conversations (API #91): a buyer and a seller talking about one listed copy.
// Nobody's email is ever part of it.

function toCopy(c) {
  return c ? { id: c.id, editionNumber: c.edition_number, condition: c.condition, askingPrice: c.asking_price_dollars ?? null, handoff: c.handoff } : null;
}

function toConversation(r, index) {
  const a = r.attributes || {};
  const poster = related(r, 'poster', index);
  const t = a.trade;
  return {
    id: r.id,
    status: a.status, // open | completed | closed
    closedReason: a.closed_reason || null,
    role: a.role, // buyer | seller
    counterpartHandle: a.counterpart_handle || null,
    unread: !!a.unread,
    lastMessage: a.last_message ? { body: a.last_message.body, fromMe: !!a.last_message.from_me, createdAt: a.last_message.created_at } : null,
    lastMessageAt: a.last_message_at || null,
    createdAt: a.created_at,
    copy: toCopy(a.copy),
    trade: t
      ? { id: t.id, status: t.status, price: t.price_dollars, allowed: t.allowed_actions || [], recordedByMe: !!t.recorded_by_me, createdAt: t.created_at }
      : null,
    allowed: a.allowed_transitions || [],
    poster: poster ? toPoster(poster, index) : null,
  };
}

function toMessage(r) {
  const a = r.attributes || {};
  return { id: r.id, body: a.body || '', createdAt: a.created_at, fromMe: !!a.from_me, senderRole: a.sender_role || null };
}

// POST /user_posters/:id/conversations  { conversation: { message?, offer_dollars? } }
// Opens the buyer's conversation about a copy, or returns the open one.
export async function startConversation(copyId, { message, offerDollars } = {}) {
  const { data } = await client.post(`/user_posters/${encodeURIComponent(copyId)}/conversations`, {
    conversation: { message: message || null, offer_dollars: offerDollars || null },
  });
  return toConversation(data.data, indexIncluded(data.included));
}

// GET /conversations?role=buying|selling&status=open|completed|closed
export async function listConversations(params = {}) {
  const { data } = await client.get('/conversations', { params: { per_page: 100, ...params } });
  const index = indexIncluded(data.included);
  return { conversations: (data.data || []).map((r) => toConversation(r, index)), unreadCount: data.meta?.unread_count ?? 0 };
}

// The nav badge: how many conversations have something unread.
export async function getUnreadCount() {
  const { data } = await client.get('/conversations', { params: { per_page: 1 } });
  return data.meta?.unread_count ?? 0;
}

export async function getConversation(id) {
  const { data } = await client.get(`/conversations/${encodeURIComponent(id)}`);
  return toConversation(data.data, indexIncluded(data.included));
}

// GET /conversations/:id/messages, oldest first. `after` fetches only newer ones.
export async function listMessages(id, params = {}) {
  const { data } = await client.get(`/conversations/${encodeURIComponent(id)}/messages`, { params });
  return { messages: (data.data || []).map(toMessage), hasEarlier: !!data.meta?.has_earlier };
}

export async function sendMessage(id, body) {
  const { data } = await client.post(`/conversations/${encodeURIComponent(id)}/messages`, { message: { body } });
  return toMessage(data.data);
}

// Marks it read up to the newest message shown, so one that arrives meanwhile stays unread.
export async function markRead(id, messageId) {
  await client.patch(`/conversations/${encodeURIComponent(id)}/read`, messageId ? { message_id: messageId } : {});
}

export async function closeConversation(id) {
  const { data } = await client.patch(`/conversations/${encodeURIComponent(id)}`, { conversation: { status: 'closed' } });
  return toConversation(data.data, indexIncluded(data.included));
}

export async function reportConversation(id, { reason, messageId } = {}) {
  await client.post(`/conversations/${encodeURIComponent(id)}/report`, { report: { reason, message_id: messageId || null } });
}

function toTrade(r, index) {
  const a = r.attributes || {};
  const poster = related(r, 'poster', index);
  return {
    id: r.id,
    status: a.status,
    price: a.price_dollars,
    editionNumber: a.edition_number,
    editionType: a.edition_type,
    condition: a.condition,
    conversationId: a.conversation_id,
    role: a.role,
    counterpartHandle: a.counterpart_handle,
    sellerConfirmed: a.seller_confirmed,
    buyerConfirmed: a.buyer_confirmed,
    awaiting: a.awaiting,
    moveCopy: a.move_copy,
    allowed: a.allowed_actions || [],
    confirmedAt: a.confirmed_at,
    poster: poster ? toPoster(poster, index) : null,
  };
}

// GET /trades?status=pending_confirmation|confirmed|cancelled
export async function listTrades(params = {}) {
  const { data } = await client.get('/trades', { params: { per_page: 100, ...params } });
  const index = indexIncluded(data.included);
  return (data.data || []).map((r) => toTrade(r, index));
}

// POST /trades — "Mark sold": records it and confirms it for the person recording.
export async function recordTrade({ conversationId, priceDollars, moveCopy, removeCopy }) {
  const { data } = await client.post('/trades', {
    trade: { conversation_id: conversationId, price_dollars: priceDollars, move_copy: moveCopy, remove_copy: removeCopy },
  });
  return toTrade(data.data, indexIncluded(data.included));
}

// PATCH /trades/:id/confirm — the other person repeats the recorded price.
export async function confirmTrade(id, { priceDollars, moveCopy, removeCopy }) {
  const { data } = await client.patch(`/trades/${encodeURIComponent(id)}/confirm`, {
    trade: { price_dollars: priceDollars, move_copy: moveCopy, remove_copy: removeCopy },
  });
  return toTrade(data.data, indexIncluded(data.included));
}

export async function cancelTrade(id) {
  const { data } = await client.patch(`/trades/${encodeURIComponent(id)}/cancel`);
  return toTrade(data.data, indexIncluded(data.included));
}
