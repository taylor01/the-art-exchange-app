import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DeleteAccount from './DeleteAccount';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

vi.mock('../api/client');
vi.mock('../store/authStore', () => ({ useAuthStore: vi.fn() }));

const setUser = vi.fn();
const setTokens = vi.fn();

function renderIt() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<DeleteAccount email="robin@example.com" />} />
        <Route path="/" element={<p>Home page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

const typeCode = (value) => fireEvent.change(screen.getByLabelText('Digit 1 of 8'), { target: { value } });

describe('DeleteAccount', () => {
  beforeEach(() => {
    useAuthStore.mockReturnValue({ setUser, setTokens });
    setUser.mockClear();
    setTokens.mockClear();
    client.post.mockResolvedValue({ status: 202, data: {} });
  });

  it('explains what is deleted and kept before sending a code', async () => {
    renderIt();
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account…' }));
    expect(screen.getByText(/deleted for good/i)).toBeInTheDocument();
    expect(screen.getByText(/kept for the other person/i)).toBeInTheDocument();
    expect(client.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Email a code to robin@example.com' }));
    await waitFor(() => expect(client.post).toHaveBeenCalledWith('/auth/code', { email: 'robin@example.com' }));
    expect(await screen.findByText(/enter the 8-digit code/i)).toBeInTheDocument();
  });

  it('deletes only after the code is entered and the button pressed, then signs out', async () => {
    client.delete.mockResolvedValue({ status: 204 });
    renderIt();
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account…' }));
    fireEvent.click(screen.getByRole('button', { name: 'Email a code to robin@example.com' }));
    await screen.findByText(/enter the 8-digit code/i);
    typeCode('12345678');
    expect(client.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    await waitFor(() => expect(client.delete).toHaveBeenCalledWith('/users/account', { data: { code: '12345678' } }));
    expect(await screen.findByText('Home page')).toBeInTheDocument();
    expect(setUser).toHaveBeenCalledWith(null);
    expect(setTokens).toHaveBeenCalledWith(null, null);
  });

  it('shows the API\'s reason when the code is wrong and keeps you signed in', async () => {
    client.delete.mockRejectedValue({ response: { status: 422, data: { errors: [{ detail: 'Invalid or expired code' }] } } });
    renderIt();
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account…' }));
    fireEvent.click(screen.getByRole('button', { name: 'Email a code to robin@example.com' }));
    await screen.findByText(/enter the 8-digit code/i);
    typeCode('00000000');
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid or expired code');
    expect(setUser).not.toHaveBeenCalled();
  });
});
