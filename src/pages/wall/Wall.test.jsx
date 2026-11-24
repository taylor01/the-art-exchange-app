import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Wall from './Wall';
import client from '../../api/client';
import { posterResource, included } from '../../test/fixtures';

vi.mock('../../api/client');

const other = { ...posterResource, id: '200', attributes: { ...posterResource.attributes, slug: 'saint-hollow-gorge-2023', name: 'Saint Hollow' } };
const copy = (id, posterId, attrs = {}) => ({
  id, type: 'user_poster',
  attributes: { status: 'owned', condition: 'near_mint', ...attrs },
  relationships: { poster: { data: { id: posterId, type: 'poster' } } },
});

function route(copies) {
  client.get.mockImplementation((url) => {
    if (url === '/user_posters') return Promise.resolve({ data: { data: copies, included: [posterResource, other, ...included] } });
    return Promise.reject(new Error(url));
  });
}

const renderWall = () => render(<MemoryRouter initialEntries={['/wall']}><Wall /></MemoryRouter>);

describe('Wall', () => {
  it('shows one tile per poster, with ×N and the editions when there are several copies', async () => {
    route([
      copy('1', '123', { edition_number: '88/200' }),
      copy('2', '123', { edition_number: 'AP 2/20', for_sale: true, asking_price_dollars: 240 }),
      copy('3', '200', { edition_number: '31/150' }),
    ]);
    renderWall();
    expect(await screen.findByText('2 posters · 3 copies')).toBeInTheDocument();
    const links = screen.getAllByRole('link').filter((a) => a.classList.contains('tax-poster'));
    expect(links).toHaveLength(2);
    const grouped = links.find((a) => a.getAttribute('href') === '/poster/moth-parade-red-rocks-2022');
    expect(within(grouped).getByText('×2')).toBeInTheDocument();
    expect(within(grouped).getByText('88/200 · AP 2/20 · 1 for sale')).toBeInTheDocument();
    expect(links.find((a) => a.getAttribute('href') === '/wall/3')).toBeTruthy();
  });

  it('lists each copy for sale on its own tile', async () => {
    route([copy('2', '123', { edition_number: 'AP 2/20', for_sale: true, asking_price_dollars: 240 }), copy('4', '123', { edition_number: '90/200', for_sale: true, asking_price_dollars: 200 })]);
    renderWall();
    await screen.findByText('1 poster · 2 copies');
    fireEvent.click(screen.getByRole('button', { name: 'For sale' }));
    expect(await screen.findByText('2 copies for sale')).toBeInTheDocument();
    const hrefs = screen.getAllByRole('link').filter((a) => a.classList.contains('tax-poster')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/wall/2', '/wall/4']);
  });
});
