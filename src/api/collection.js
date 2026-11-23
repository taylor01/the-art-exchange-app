// The signed-in collector's wall (user_posters), shows and profile.
import client from './client';
import { indexIncluded, related } from './jsonapi';
import { toPoster } from './catalog';

function toCopy(resource, index) {
  const a = resource.attributes || {};
  const poster = related(resource, 'poster', index);
  return {
    id: resource.id,
    status: a.status,
    condition: a.condition,
    editionNumber: a.edition_number,
    notes: a.notes,
    forSale: Boolean(a.for_sale),
    purchaseDate: a.purchase_date,
    purchasePrice: a.purchase_price_dollars,
    askingPrice: a.asking_price_dollars,
    handoff: a.handoff || null,
    imageUrls: a.image_urls || [],
    poster: poster ? toPoster(poster, index) : null,
  };
}

// GET /user_posters  (status: owned | wanted | watching, for_sale: true)
export async function listCopies(params = {}) {
  const { data } = await client.get('/user_posters', { params: { per_page: 200, ...params } });
  const index = indexIncluded(data.included);
  return { copies: (data.data || []).map((r) => toCopy(r, index)), meta: data.meta || {} };
}

export async function getCopy(id) {
  const { data } = await client.get(`/user_posters/${encodeURIComponent(id)}`);
  return toCopy(data.data, indexIncluded(data.included));
}

// attrs use the API's names: poster_id, status, condition, edition_number,
// notes, for_sale, purchase_date, purchase_price_cents, asking_price_cents
export async function createCopy(attrs) {
  const { data } = await client.post('/user_posters', { user_poster: attrs });
  return toCopy(data.data, indexIncluded(data.included));
}

export async function updateCopy(id, attrs) {
  const { data } = await client.patch(`/user_posters/${encodeURIComponent(id)}`, { user_poster: attrs });
  return toCopy(data.data, indexIncluded(data.included));
}

export async function deleteCopy(id) {
  await client.delete(`/user_posters/${encodeURIComponent(id)}`);
}

// GET /user_shows?include=show
export async function listShows(params = {}) {
  const { data } = await client.get('/user_shows', { params: { include: 'show', per_page: 200, ...params } });
  const index = indexIncluded(data.included);
  return (data.data || []).map((r) => {
    const show = related(r, 'show', index);
    const s = show?.attributes || {};
    return {
      id: r.id,
      bookmarked: r.attributes.bookmarked,
      attendance: r.attributes.attendance_status,
      show: show ? { id: show.id, date: s.show_date, name: s.display_name, recordingCount: s.recording_count, totalSongs: s.total_songs } : null,
    };
  });
}

// GET /shows/:id/bookmark -> the collector's record for a show, or null
export async function getShowMark(showId) {
  try {
    const { data } = await client.get(`/shows/${encodeURIComponent(showId)}/bookmark`);
    return { attendance: data.data.attributes.attendance_status, bookmarked: data.data.attributes.bookmarked };
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

// PUT /shows/:id/bookmark  { attendance_status: 'attended' | 'missed', bookmarked }
export async function markShow(showId, attrs) {
  const { data } = await client.put(`/shows/${encodeURIComponent(showId)}/bookmark`, attrs);
  return { attendance: data.data.attributes.attendance_status, bookmarked: data.data.attributes.bookmarked };
}

// PATCH /users/profile  { name, location, bio, website }
export async function updateProfile(attrs) {
  const { data } = await client.patch('/users/profile', { user: attrs });
  return data.data?.attributes || {};
}

// GET /users/profile -> the signed-in collector, including handle and list visibility
export async function getProfile() {
  const { data } = await client.get('/users/profile');
  return toProfile(data.data);
}

// PATCH /users/profile for handle and list visibility; returns the saved profile.
// attrs: { name, location, handle, for_sale_public, wanted_public }
export async function saveProfile(attrs) {
  const { data } = await client.patch('/users/profile', { user: attrs });
  return toProfile(data.data);
}

function toProfile(resource) {
  const a = resource?.attributes || {};
  return {
    id: resource?.id,
    email: a.email,
    name: a.name,
    displayName: a.display_name,
    location: a.location,
    handle: a.handle,
    handleChangeableAt: a.handle_changeable_at,
    forSalePublic: Boolean(a.for_sale_public),
    wantedPublic: Boolean(a.wanted_public),
  };
}

// The first error detail from a JSON:API error response, if any.
export function apiErrorDetail(error) {
  return error?.response?.data?.errors?.[0]?.detail || null;
}

// GET /users/handle_available?handle= -> { available, reason, suggestions }
export async function checkHandle(handle) {
  const { data } = await client.get('/users/handle_available', { params: { handle } });
  return { available: Boolean(data.available), reason: data.reason || null, suggestions: data.suggestions || [] };
}

// Public collector page (no auth). `id` is the collector's current handle.
export async function getCollector(handle) {
  const { data } = await client.get(`/collectors/${encodeURIComponent(handle)}`);
  const a = data.data.attributes || {};
  return {
    handle: data.data.id,
    displayName: a.display_name,
    location: a.location,
    publicLists: a.public_lists || [],
    forSaleCount: a.for_sale_count,
    wantedCount: a.wanted_count,
  };
}

// GET /collectors/:handle/for_sale | /wanted
export async function getCollectorList(handle, list, page = 1) {
  const { data } = await client.get(`/collectors/${encodeURIComponent(handle)}/${list}`, {
    params: { page, per_page: 40, include: 'poster.band,poster.venue,poster.artists' },
  });
  const index = indexIncluded(data.included);
  return {
    copies: (data.data || []).map((r) => {
      const poster = related(r, 'poster', index);
      return {
        id: r.id,
        editionNumber: r.attributes.edition_number,
        condition: r.attributes.condition,
        askingPrice: r.attributes.asking_price_dollars ?? null,
        poster: poster ? toPoster(poster, index) : null,
      };
    }),
    meta: data.meta || {},
  };
}

// Deleting an account takes a fresh sign-in code (API #88), so a stolen
// session alone can't delete it. POST /auth/code emails one.
export async function requestAccountCode(email) {
  await client.post('/auth/code', { email });
}

// DELETE /users/account { code } -> 204. A wrong code is a 422 with a detail.
export async function deleteAccount(code) {
  await client.delete('/users/account', { data: { code } });
}
