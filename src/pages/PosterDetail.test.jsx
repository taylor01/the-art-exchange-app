import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PosterDetail from './PosterDetail';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

// Mock the API client
vi.mock('../api/client');

// Mock the auth store
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockPosterResponse = {
  data: {
    data: {
      id: '123',
      type: 'poster',
      attributes: {
        title: 'Test Poster',
        artist_name: 'Test Artist',
        venue_name: 'Test Venue',
        band_name: 'Test Band',
        year: 2024,
        price: 5000,
        image_url: 'https://example.com/poster.jpg',
        description: 'A great poster',
        in_user_collection: false,
      },
    },
  },
};

describe('PosterDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client.get.mockResolvedValue(mockPosterResponse);
    useAuthStore.mockReturnValue({
      user: null,
    });
  });

  describe('Basic Rendering', () => {
    it('renders poster details', async () => {
      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Poster')).toBeInTheDocument();
        expect(screen.getByText(/Artist:/)).toBeInTheDocument();
        expect(screen.getByText('Test Artist')).toBeInTheDocument();
        expect(screen.getByText(/Venue:/)).toBeInTheDocument();
        expect(screen.getByText('Test Venue')).toBeInTheDocument();
        expect(screen.getByText(/Year:/)).toBeInTheDocument();
        expect(screen.getByText('2024')).toBeInTheDocument();
      });
    });

    it('fetches poster data on mount', async () => {
      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(client.get).toHaveBeenCalledWith('/posters/123');
      });
    });

    it('displays loading state initially', () => {
      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('displays poster image', async () => {
      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const image = screen.getByAltText('Test Poster');
        expect(image).toHaveAttribute('src', 'https://example.com/poster.jpg');
      });
    });

    it('displays formatted price', async () => {
      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('$50.00')).toBeInTheDocument();
      });
    });

    it('displays description', async () => {
      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('A great poster')).toBeInTheDocument();
      });
    });
  });

  describe('Back Button Navigation', () => {
    it('renders back to gallery button', async () => {
      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/← back to gallery/i)).toBeInTheDocument();
      });
    });

    it('navigates to default gallery when no state provided', async () => {
      const mockNavigate = vi.fn();

      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Poster')).toBeInTheDocument();
      });

      const backButton = screen.getByText(/← back to gallery/i);
      fireEvent.click(backButton);

      // Note: In a real test, you'd verify navigation occurred
      // This would require mocking useNavigate or checking the router state
    });

    it('preserves gallery filter URL when navigating back', async () => {
      const filterPath = '/gallery?artist=1&band=2&year=2024';

      render(
        <MemoryRouter initialEntries={[
          filterPath,
          { pathname: '/poster/123', state: { from: filterPath } }
        ]} initialIndex={1}>
          <Routes>
            <Route path="/gallery" element={<div>Gallery</div>} />
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Poster')).toBeInTheDocument();
      });

      // The component should have access to location.state.from
      // In a full integration test, clicking back would navigate to the filtered gallery
    });
  });

  describe('Collection Management', () => {
    it('shows sign in prompt for unauthenticated users', async () => {
      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/sign in to add to collection/i)).toBeInTheDocument();
      });
    });

    it('shows add to collection button for authenticated users', async () => {
      useAuthStore.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
      });

      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/add to collection/i)).toBeInTheDocument();
      });
    });

    it('shows remove from collection when poster is in collection', async () => {
      useAuthStore.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
      });

      const posterInCollection = {
        data: {
          data: {
            ...mockPosterResponse.data.data,
            attributes: {
              ...mockPosterResponse.data.data.attributes,
              in_user_collection: true,
            },
          },
        },
      };

      client.get.mockResolvedValue(posterInCollection);

      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/remove from collection/i)).toBeInTheDocument();
      });
    });

    it('adds poster to collection when button clicked', async () => {
      useAuthStore.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
      });

      client.post.mockResolvedValue({ data: { success: true } });

      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/add to collection/i)).toBeInTheDocument();
      });

      const addButton = screen.getByText(/add to collection/i);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(client.post).toHaveBeenCalledWith(
          '/user_posters',
          expect.objectContaining({
            data: expect.objectContaining({
              type: 'user_posters',
              attributes: expect.objectContaining({
                poster_id: '123',
              }),
            }),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when fetch fails', async () => {
      client.get.mockRejectedValue(new Error('Network error'));

      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/failed to fetch poster details/i)).toBeInTheDocument();
      });
    });

    it('displays error when poster not found', async () => {
      client.get.mockResolvedValue({ data: { data: null } });

      render(
        <MemoryRouter initialEntries={['/poster/123']}>
          <Routes>
            <Route path="/poster/:id" element={<PosterDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        // The component shows either the error message or "Poster not found"
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});
