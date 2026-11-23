import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';

function reply(status, body) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, pendingEmail: null, isLoading: false, error: null });
    globalThis.fetch = vi.fn();
  });

  it('starts signed out', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('setTokens and setUser update the session', () => {
    useAuthStore.getState().setTokens('a', 'r');
    useAuthStore.getState().setUser({ id: 1 });
    expect(useAuthStore.getState()).toMatchObject({ accessToken: 'a', refreshToken: 'r', user: { id: 1 } });
  });

  it('requestCode posts the normalized email to /auth/code and remembers it', async () => {
    fetch.mockReturnValue(reply(202, { message: 'sent' }));
    const result = await useAuthStore.getState().requestCode('  Me@Example.com ');
    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/code$/), expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'me@example.com' }) }));
    expect(useAuthStore.getState().pendingEmail).toBe('me@example.com');
  });

  it('requestCode refuses an address without @ before calling the API', async () => {
    const result = await useAuthStore.getState().requestCode('nope');
    expect(result.success).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('requestCode explains rate limits', async () => {
    fetch.mockReturnValue(reply(429, { errors: [{ title: 'Too Many Requests' }] }));
    const result = await useAuthStore.getState().requestCode('me@example.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/too many/i);
  });

  it('verifyCode stores tokens and the user, and clears the pending email', async () => {
    useAuthStore.setState({ pendingEmail: 'me@example.com' });
    fetch.mockReturnValue(reply(200, { access_token: 'acc', refresh_token: 'ref', user: { id: 4, email: 'me@example.com', name: null } }));
    const result = await useAuthStore.getState().verifyCode('481 207');
    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/verify$/), expect.objectContaining({ body: JSON.stringify({ email: 'me@example.com', code: '481207' }) }));
    expect(useAuthStore.getState()).toMatchObject({ accessToken: 'acc', refreshToken: 'ref', pendingEmail: null, user: { id: 4 } });
  });

  it('verifyCode needs all six digits', async () => {
    useAuthStore.setState({ pendingEmail: 'me@example.com' });
    const result = await useAuthStore.getState().verifyCode('123');
    expect(result.success).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('verifyCode reports a wrong code', async () => {
    useAuthStore.setState({ pendingEmail: 'me@example.com' });
    fetch.mockReturnValue(reply(401, { error: 'Invalid or expired code' }));
    const result = await useAuthStore.getState().verifyCode('000000');
    expect(result.success).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('logout clears the session and tells the API', () => {
    fetch.mockReturnValue(reply(200, {}));
    useAuthStore.setState({ user: { id: 1 }, accessToken: 'acc', refreshToken: 'ref' });
    useAuthStore.getState().logout();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/logout$/), expect.objectContaining({ method: 'DELETE' }));
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null, refreshToken: null });
  });
});
