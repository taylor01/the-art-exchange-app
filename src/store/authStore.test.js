import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    });
  });

  it('initializes with null user and tokens', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('setTokens updates access and refresh tokens', () => {
    const { setTokens } = useAuthStore.getState();
    setTokens('access123', 'refresh456');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access123');
    expect(state.refreshToken).toBe('refresh456');
  });

  it('setUser updates user data', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const { setUser } = useAuthStore.getState();
    setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  it('logout clears user and tokens', () => {
    // Set some data first
    useAuthStore.setState({
      user: { id: 1, email: 'test@example.com' },
      accessToken: 'token123',
      refreshToken: 'refresh123',
    });

    const { logout } = useAuthStore.getState();
    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('setLoading updates loading state', () => {
    const { setLoading } = useAuthStore.getState();
    setLoading(true);

    expect(useAuthStore.getState().isLoading).toBe(true);

    setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('setError updates error state', () => {
    const { setError } = useAuthStore.getState();
    setError('Test error');

    expect(useAuthStore.getState().error).toBe('Test error');
  });
});
