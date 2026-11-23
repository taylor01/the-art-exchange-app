// Public catalog: posters, shows, setlists, recordings.
import client from './client';
import { indexIncluded, related, relatedId } from './jsonapi';

const LIST_INCLUDE = 'band,venue,artists';
const DETAIL_INCLUDE = 'band,venue,show,artists,series';

function toVenue(resource) {
  if (!resource) return null;
  const a = resource.attributes || {};
  return {
    id: resource.id,
    name: a.name,
    city: a.city,
    region: a.administrative_area,
    country: a.country,
    address: a.full_address || a.address,
    website: a.website,
    venueType: a.venue_type,
  };
}

function toNamed(resource) {
  if (!resource) return null;
  return { id: resource.id, name: resource.attributes?.name, website: resource.attributes?.website || null };
}

function toShowRef(resource) {
  if (!resource) return null;
  const a = resource.attributes || {};
  return {
    id: resource.id,
    slug: a.slug,
    date: a.show_date,
    formattedDate: a.formatted_date,
    displayName: a.display_name,
    notes: a.show_notes,
    totalSongs: a.total_songs,
    hasRecordings: a.has_recordings,
    recordingCount: a.recording_count,
  };
}

// A poster resource -> the shape the UI uses.
export function toPoster(resource, index = new Map()) {
  const a = resource.attributes || {};
  return {
    id: resource.id,
    slug: a.slug,
    path: `/poster/${a.slug || resource.id}`,
    name: a.name,
    description: a.description,
    year: a.year,
    editionSize: a.edition_size,
    priceDollars: a.price_dollars,
    imageUrl: a.detail_url || a.image_url || a.thumbnail_url || a.grid_thumbnail_url || null,
    gridUrl: a.grid_thumbnail_url || a.thumbnail_url || a.image_url || null,
    smallUrl: a.small_thumbnail_url || a.grid_thumbnail_url || null,
    blurUrl: a.blur_placeholder_url || null,
    band: toNamed(related(resource, 'band', index)),
    venue: toVenue(related(resource, 'venue', index)),
    show: toShowRef(related(resource, 'show', index)),
    showId: relatedId(resource, 'show'),
    artists: (related(resource, 'artists', index) || []).map(toNamed),
    series: (related(resource, 'series', index) || []).map(toNamed),
  };
}

// GET /posters/search -> { posters, meta, facets }
export async function searchPosters(params = {}) {
  const { data } = await client.get('/posters/search', { params: { include: LIST_INCLUDE, ...params } });
  const index = indexIncluded(data.included);
  return {
    posters: (data.data || []).map((r) => toPoster(r, index)),
    meta: data.meta || {},
    facets: data.meta?.facets || {},
  };
}

// GET /posters/:id (id or slug)
export async function getPoster(id) {
  const { data } = await client.get(`/posters/${encodeURIComponent(id)}`, { params: { include: DETAIL_INCLUDE } });
  return toPoster(data.data, indexIncluded(data.included));
}

// GET /shows/:id -> show with band, venue and every poster from that night
export async function getShow(id) {
  const { data } = await client.get(`/shows/${encodeURIComponent(id)}`);
  const index = indexIncluded(data.included);
  return {
    ...toShowRef(data.data),
    band: toNamed(related(data.data, 'band', index)),
    venue: toVenue(related(data.data, 'venue', index)),
    posters: (related(data.data, 'posters', index) || []).map((r) => toPoster(r, index)),
  };
}

// GET /shows/:id/setlist_songs -> main set and encore, in order
export async function getSetlist(showId) {
  const { data } = await client.get(`/shows/${encodeURIComponent(showId)}/setlist_songs`);
  return (data.data || []).map((r) => ({
    id: r.id,
    set: r.attributes.set_type === 'encore' ? 'encore' : 'main',
    position: r.attributes.position,
    title: r.attributes.song_title,
    note: r.attributes.notes_summary || (r.attributes.has_jam ? 'Jam' : r.attributes.has_guests ? 'Guests' : ''),
  }));
}

// GET /shows/:id/recordings
export async function getRecordings(showId) {
  const { data } = await client.get(`/shows/${encodeURIComponent(showId)}/recordings`);
  return (data.data || []).map((r) => ({
    id: r.id,
    title: r.attributes.title || 'Recording',
    taper: r.attributes.taper,
    quality: r.attributes.quality,
    duration: r.attributes.formatted_duration,
    trackCount: r.attributes.track_count,
  }));
}
