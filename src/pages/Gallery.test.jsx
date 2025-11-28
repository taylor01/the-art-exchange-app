import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Gallery from './Gallery';
import client from '../api/client';

// Mock the API client
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

const mockPosterData = {
  data: [
    {
      id: '1',
      type: 'poster',
      attributes: {
        title: 'Test Poster 1',
        band_name: 'Test Band',
        venue_name: 'Test Venue',
        year: 2024,
        grid_thumbnail_url: 'https://example.com/poster1.jpg',
        blur_placeholder_url: 'https://example.com/poster1-blur.jpg',
      },
    },
    {
      id: '2',
      type: 'poster',
      attributes: {
        title: 'Test Poster 2',
        band_name: 'Another Band',
        venue_name: 'Another Venue',
        year: 2023,
        grid_thumbnail_url: 'https://example.com/poster2.jpg',
        blur_placeholder_url: 'https://example.com/poster2-blur.jpg',
      },
    },
  ],
  meta: {
    total_count: 2,
    total_pages: 1,
    current_page: 1,
  },
};

const mockFacetsData = {
  data: [],
  meta: {
    facets: {
      artists: [
        { id: 1, name: 'Artist 1' },
        { id: 2, name: 'Artist 2' },
      ],
      bands: [
        { id: 1, name: 'Test Band' },
        { id: 2, name: 'Another Band' },
      ],
      venues: [
        { id: 1, name: 'Test Venue', city: 'Denver' },
        { id: 2, name: 'Another Venue', city: 'Boulder' },
      ],
      years: [
        { name: 2024 },
        { name: 2023 },
      ],
    },
  },
};

describe('Gallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client.get.mockResolvedValue({ data: mockPosterData });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the gallery page', async () => {
      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Poster 1')).toBeInTheDocument();
        expect(screen.getByText('Test Poster 2')).toBeInTheDocument();
      });
    });

    it('fetches posters on mount', async () => {
      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith(
          '/posters/search',
          expect.objectContaining({
            params: expect.objectContaining({
              page: 1,
              per_page: 40,
            }),
          })
        );
      });
    });

    it('fetches facets on mount', async () => {
      client.get.mockImplementation((url) => {
        if (url === '/posters/search') {
          return Promise.resolve({ data: mockFacetsData });
        }
        return Promise.resolve({ data: mockPosterData });
      });

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith('/posters/search', expect.any(Object));
      });
    });

    it('displays loading state initially', () => {
      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
    });

    it('displays poster count', async () => {
      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/showing 2 of 2 posters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('updates search query when typing in search box', async () => {
      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Poster 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search posters, artists, venues/i);
      fireEvent.change(searchInput, { target: { value: 'test query' } });

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith(
          '/posters/search',
          expect.objectContaining({
            params: expect.objectContaining({
              query: 'test query',
            }),
          })
        );
      });
    });
  });

  describe('Faceted Filtering', () => {
    it('renders facet sections', async () => {
      client.get.mockResolvedValue({ data: mockFacetsData });

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Artists')).toBeInTheDocument();
        expect(screen.getByText('Bands')).toBeInTheDocument();
        expect(screen.getByText('Venues')).toBeInTheDocument();
        expect(screen.getByText('Years')).toBeInTheDocument();
      });
    });

    it('applies artist filter when checkbox is selected', async () => {
      client.get.mockResolvedValue({ data: mockFacetsData });

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Artist 1')).toBeInTheDocument();
      });

      const artistCheckbox = screen.getByLabelText('Artist 1');
      fireEvent.click(artistCheckbox);

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith(
          '/posters/search',
          expect.objectContaining({
            params: expect.objectContaining({
              artist_ids: [1],
            }),
          })
        );
      });
    });

    it('applies multiple artist filters', async () => {
      client.get.mockResolvedValue({ data: mockFacetsData });

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Artist 1')).toBeInTheDocument();
      });

      const artist1Checkbox = screen.getByLabelText('Artist 1');
      const artist2Checkbox = screen.getByLabelText('Artist 2');

      // Click both checkboxes
      fireEvent.click(artist1Checkbox);
      fireEvent.click(artist2Checkbox);

      // Verify both checkboxes are checked
      await waitFor(() => {
        expect(artist1Checkbox).toBeChecked();
        expect(artist2Checkbox).toBeChecked();
      });
    });

    it('shows active filter count badge', async () => {
      client.get.mockResolvedValue({ data: mockFacetsData });

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Artist 1')).toBeInTheDocument();
      });

      const artistCheckbox = screen.getByLabelText('Artist 1');
      fireEvent.click(artistCheckbox);

      await waitFor(() => {
        const badges = screen.getAllByText('1');
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('clears all filters when clear button is clicked', async () => {
      client.get.mockResolvedValue({ data: mockFacetsData });

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Artist 1')).toBeInTheDocument();
      });

      const artistCheckbox = screen.getByLabelText('Artist 1');
      fireEvent.click(artistCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByText(/clear filters/i);
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith(
          '/posters/search',
          expect.objectContaining({
            params: expect.not.objectContaining({
              artist_ids: expect.anything(),
            }),
          })
        );
      });
    });
  });

  describe('Sorting', () => {
    it('applies sort parameter when sort is changed', async () => {
      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Poster 1')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'oldest' } });

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith(
          '/posters/search',
          expect.objectContaining({
            params: expect.objectContaining({
              sort: 'oldest',
            }),
          })
        );
      });
    });
  });

  describe('URL State Management', () => {
    it('initializes filters from URL parameters', async () => {
      render(
        <MemoryRouter initialEntries={['/gallery?artist=1&artist=2&band=1&year=2024']}>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith(
          '/posters/search',
          expect.objectContaining({
            params: expect.objectContaining({
              artist_ids: [1, 2],
              band_id: 1,
              year: 2024,
            }),
          })
        );
      });
    });

    it('initializes search query from URL', async () => {
      render(
        <MemoryRouter initialEntries={['/gallery?q=test+search']}>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith(
          '/posters/search',
          expect.objectContaining({
            params: expect.objectContaining({
              query: 'test search',
            }),
          })
        );
      });
    });

    it('initializes sort from URL', async () => {
      render(
        <MemoryRouter initialEntries={['/gallery?sort=oldest']}>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith(
          '/posters/search',
          expect.objectContaining({
            params: expect.objectContaining({
              sort: 'oldest',
            }),
          })
        );
      });
    });
  });

  describe('Infinite Scroll', () => {
    it('resets to page 1 when filters change', async () => {
      client.get.mockResolvedValue({ data: mockFacetsData });

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Artist 1')).toBeInTheDocument();
      });

      // Select a filter
      const artistCheckbox = screen.getByLabelText('Artist 1');
      fireEvent.click(artistCheckbox);

      await waitFor(() => {
        const calls = client.get.mock.calls.filter(
          call => call[0] === '/posters/search' && call[1]?.params?.artist_ids
        );
        const lastCall = calls[calls.length - 1];
        expect(lastCall[1].params.page).toBe(1);
      });
    });

    it('displays "end of results" message when all posters are loaded', async () => {
      const limitedData = {
        ...mockPosterData,
        meta: {
          total_count: 2,
          total_pages: 1,
          current_page: 1,
        },
      };
      client.get.mockResolvedValue({ data: limitedData });

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/you've reached the end of the gallery/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when fetch fails', async () => {
      client.get.mockRejectedValue(new Error('Network error'));

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/failed to fetch posters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no posters found', async () => {
      client.get.mockResolvedValue({
        data: {
          data: [],
          meta: { total_count: 0 },
        },
      });

      render(
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no posters found/i)).toBeInTheDocument();
        expect(screen.getByText(/try adjusting your search or filter criteria/i)).toBeInTheDocument();
      });
    });
  });
});
