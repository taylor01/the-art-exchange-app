import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PosterCard from './PosterCard';

const mockPoster = {
  id: '1',
  attributes: {
    title: 'Test Poster',
    artist_name: 'Test Artist',
    venue_name: 'Test Venue',
    band_name: 'Test Band',
    year: '2024',
    price: 5000,
    image_url: 'https://example.com/poster.jpg',
  },
};

describe('PosterCard', () => {
  it('renders poster title', () => {
    render(
      <BrowserRouter>
        <PosterCard poster={mockPoster} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Poster')).toBeInTheDocument();
  });

  it('renders band name when provided', () => {
    render(
      <BrowserRouter>
        <PosterCard poster={mockPoster} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Band')).toBeInTheDocument();
  });

  it('renders venue name when provided', () => {
    render(
      <BrowserRouter>
        <PosterCard poster={mockPoster} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Venue')).toBeInTheDocument();
  });

  it('renders year', () => {
    render(
      <BrowserRouter>
        <PosterCard poster={mockPoster} />
      </BrowserRouter>
    );
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('renders formatted price', () => {
    render(
      <BrowserRouter>
        <PosterCard poster={mockPoster} />
      </BrowserRouter>
    );
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('renders image with correct src', () => {
    render(
      <BrowserRouter>
        <PosterCard poster={mockPoster} />
      </BrowserRouter>
    );
    const image = screen.getByAltText('Test Poster');
    expect(image).toHaveAttribute('src', 'https://example.com/poster.jpg');
  });

  it('links to poster detail page', () => {
    render(
      <BrowserRouter>
        <PosterCard poster={mockPoster} />
      </BrowserRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/poster/1');
  });
});
