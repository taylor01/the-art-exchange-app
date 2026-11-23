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
