import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PosterCard from './PosterCard';
import { toPoster } from '../api/catalog';
import { indexIncluded } from '../api/jsonapi';
import { posterResource, included } from '../test/fixtures';

const poster = toPoster(posterResource, indexIncluded(included));

function renderCard(props = {}) {
  return render(
    <BrowserRouter>
      <PosterCard poster={poster} {...props} />
    </BrowserRouter>
  );
}

describe('PosterCard', () => {
  it('shows the band, title, venue and artist', () => {
    renderCard();
    expect(screen.getByText('Moth Parade')).toBeInTheDocument();
    expect(screen.getByText('Night One')).toBeInTheDocument();
    expect(screen.getByText('Red Rocks, Morrison')).toBeInTheDocument();
    expect(screen.getByText('Art: Jen Ruiz')).toBeInTheDocument();
  });

  it('links to the poster page by slug', () => {
    renderCard();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/poster/moth-parade-red-rocks-2022');
  });

  it('shows the edition size as a sticker by default', () => {
    renderCard();
    expect(screen.getByText('Run of 200')).toBeInTheDocument();
  });

  it('uses a given sticker and link', () => {
    renderCard({ sticker: 'For sale', to: '/wall/9' });
    expect(screen.getByText('For sale')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/wall/9');
  });

  it('uses the grid thumbnail with descriptive alt text', () => {
    renderCard();
    const img = screen.getByAltText('Moth Parade poster Red Rocks 2022');
    expect(img).toHaveAttribute('src', 'https://example.com/poster-grid.jpg');
  });
});
