import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import client from '../api/client';

vi.mock('../api/client');

const profile = {
  id: '1', email: 'me@example.com', name: 'Robin', displayName: 'Robin', location: 'Durham, NC',
  handle: 'velvet_owl_4821', handleChangeableAt: null, forSalePublic: false, wantedPublic: true,
};

const savedDoc = (attrs = {}) => ({
  data: { data: { id: '1', type: 'user', attributes: { email: 'me@example.com', name: 'Robin', display_name: 'Robin', location: 'Durham, NC', handle: 'velvet_owl_4821', for_sale_public: false, wanted_public: true, ...attrs } } },
});

function renderForm(props = {}) {
  return render(<MemoryRouter><ProfileForm profile={profile} {...props} /></MemoryRouter>);
}

describe('ProfileForm', () => {
  beforeEach(() => {
    client.patch.mockResolvedValue(savedDoc());
    client.get.mockResolvedValue({ data: { available: true, reason: null, suggestions: [] } });
  });

  it('shows the generated handle and what visitors will see', () => {
    renderForm();
    expect(screen.getByLabelText('Handle')).toHaveValue('velvet_owl_4821');
    expect(screen.getByText(/this is your handle/i)).toBeInTheDocument();
    expect(screen.getByText('Robin')).toBeInTheDocument();
  });

  it('saves visibility without sending an unchanged handle', async () => {
    const onSaved = vi.fn();
    renderForm({ onSaved });
    fireEvent.click(screen.getByRole('switch', { name: 'Make For sale public' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(client.patch).toHaveBeenCalledWith('/users/profile', {
      user: { name: 'Robin', location: 'Durham, NC', for_sale_public: true, wanted_public: true },
    }));
    expect(onSaved).toHaveBeenCalled();
  });

  it('warns when turning off a list that was public', () => {
    renderForm();
    fireEvent.click(screen.getByRole('switch', { name: 'Make Hunting public' }));
    expect(screen.getByText(/links you.ve shared to this list will stop working/i)).toBeInTheDocument();
  });

  it('checks a new handle and offers suggestions when it is taken', async () => {
    client.get.mockResolvedValue({ data: { available: false, reason: 'taken', suggestions: ['moth_fan_27'] } });
    renderForm();
    fireEvent.change(screen.getByLabelText('Handle'), { target: { value: 'moth_fan' } });
    expect(await screen.findByText('That handle is taken.', {}, { timeout: 2000 })).toBeInTheDocument();
    expect(client.get).toHaveBeenCalledWith('/users/handle_available', { params: { handle: 'moth_fan' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '@moth_fan_27' }));
    expect(screen.getByLabelText('Handle')).toHaveValue('moth_fan_27');
  });

  it('does not call the API for a handle that breaks the format rule', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Handle'), { target: { value: 'ab' } });
    expect(screen.getByText(/3–30 characters/)).toBeInTheDocument();
    expect(client.get).not.toHaveBeenCalled();
  });

  it('shows the API error when saving fails', async () => {
    client.patch.mockRejectedValue({ response: { data: { errors: [{ detail: 'Handle can be changed once every 30 days; you can change it again on Dec 20' }] } } });
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/once every 30 days/);
  });
});
