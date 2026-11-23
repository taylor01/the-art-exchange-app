// JSON:API documents shaped like the API's responses, for tests.

export const posterResource = {
  id: '123',
  type: 'poster',
  attributes: {
    name: 'Night One',
    slug: 'moth-parade-red-rocks-2022',
    description: 'A four-color screenprint.',
    year: 2022,
    edition_size: 200,
    price_dollars: 40,
    image_url: 'https://example.com/poster.jpg',
    grid_thumbnail_url: 'https://example.com/poster-grid.jpg',
    blur_placeholder_url: 'https://example.com/poster-blur.jpg',
  },
  relationships: {
    band: { data: { id: '7', type: 'band' } },
    venue: { data: { id: '9', type: 'venue' } },
    show: { data: { id: '55', type: 'show' } },
    artists: { data: [{ id: '3', type: 'artist' }] },
    series: { data: [] },
  },
};

export const included = [
  { id: '7', type: 'band', attributes: { name: 'Moth Parade' } },
  { id: '9', type: 'venue', attributes: { name: 'Red Rocks', city: 'Morrison', administrative_area: 'CO', country: 'US' } },
  { id: '3', type: 'artist', attributes: { name: 'Jen Ruiz', website: null } },
  { id: '55', type: 'show', attributes: { show_date: '2022-08-14', display_name: 'Moth Parade at Red Rocks' } },
];

export const posterDoc = { data: posterResource, included };

export const searchDoc = (posters = [posterResource], meta = {}) => ({
  data: posters,
  included,
  meta: {
    total_count: posters.length,
    total_pages: 1,
    current_page: 1,
    per_page: 40,
    facets: {
      artists: [{ id: 3, name: 'Jen Ruiz', count: 1 }],
      bands: [{ id: 7, name: 'Moth Parade', count: 1 }],
      venues: [{ id: 9, name: 'Red Rocks', count: 1 }],
      years: [{ year: 2022, count: 1 }],
    },
    ...meta,
  },
});

export const showDoc = {
  data: {
    id: '55',
    type: 'show',
    attributes: { show_date: '2022-08-14', display_name: 'Moth Parade at Red Rocks' },
    relationships: {
      band: { data: { id: '7', type: 'band' } },
      venue: { data: { id: '9', type: 'venue' } },
      posters: { data: [{ id: '123', type: 'poster' }] },
    },
  },
  included: [...included, posterResource],
};

export const setlistDoc = {
  data: [
    { id: 's1', type: 'setlist_song', attributes: { set_type: 'main_set', position: 1, song_title: 'Lantern Season', notes_summary: null } },
    { id: 's2', type: 'setlist_song', attributes: { set_type: 'encore', position: 1, song_title: 'Moth Parade', notes_summary: null } },
  ],
};

export const recordingsDoc = { data: [] };

export const listingsDoc = {
  data: [
    { id: '91', type: 'listing', attributes: { edition_number: '112/200', condition: 'near_mint', handoff: 'ships', asking_price_dollars: 195, seller_handle: 'gorgeous_g', listed_at: '2026-11-01T00:00:00Z' } },
  ],
  meta: { total_count: 1 },
};

export const historyDoc = {
  data: {
    id: '123',
    type: 'price_history',
    attributes: {
      points: [
        { date: '2026-06-01', price_dollars: 160, edition_label: '40/200' },
        { date: '2026-10-01', price_dollars: 185, edition_label: '88/200' },
      ],
      summary: { last_sale: { date: '2026-10-01', price_dollars: 185 }, median_12m: 172.5, low_12m: 160, high_12m: 185, count_12m: 2, count_all: 2, release_price_dollars: 40 },
    },
  },
};
