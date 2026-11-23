// Buying and selling: listings, price history, inquiries and trades (API #80, #82).
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

// POST /user_posters/:id/inquiries  { inquiry: { message, offer_dollars } }
export async function askAboutCopy(copyId, { message, offerDollars }) {
  const { data } = await client.post(`/user_posters/${encodeURIComponent(copyId)}/inquiries`, {
    inquiry: { message: message || null, offer_dollars: offerDollars || null },
  });
  return toInquiry(data.data, indexIncluded(data.included));
}

function toInquiry(r, index) {
  const a = r.attributes || {};
  const poster = related(r, 'poster', index);
  return {
    id: r.id,
    status: a.status,
    closedReason: a.closed_reason,
    message: a.message,
    offer: a.offer_dollars ?? null,
    createdAt: a.created_at,
    role: a.role,
    counterpartHandle: a.counterpart_handle,
    counterpartEmail: a.counterpart_email || null,
    tradeId: a.trade_id || null,
    copy: a.copy
      ? { id: a.copy.id, editionNumber: a.copy.edition_number, condition: a.copy.condition, askingPrice: a.copy.asking_price_dollars ?? null, handoff: a.copy.handoff }
      : null,
    allowed: a.allowed_transitions || [],
    poster: poster ? toPoster(poster, index) : null,
  };
}

// GET /inquiries?role=sent|received&status=
export async function listInquiries(params = {}) {
  const { data } = await client.get('/inquiries', { params: { per_page: 100, ...params } });
  const index = indexIncluded(data.included);
  return (data.data || []).map((r) => toInquiry(r, index));
}

// PATCH /inquiries/:id  { inquiry: { status } }
export async function setInquiryStatus(id, status) {
  const { data } = await client.patch(`/inquiries/${encodeURIComponent(id)}`, { inquiry: { status } });
  return toInquiry(data.data, indexIncluded(data.included));
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
    inquiryId: a.inquiry_id,
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

// POST /trades — records it and confirms it for the person recording.
export async function recordTrade({ inquiryId, priceDollars, moveCopy, removeCopy }) {
  const { data } = await client.post('/trades', {
    trade: { inquiry_id: inquiryId, price_dollars: priceDollars, move_copy: moveCopy, remove_copy: removeCopy },
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
