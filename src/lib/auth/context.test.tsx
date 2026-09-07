import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './context';

// ─── Mock supabase ────────────────────────────────────────────────────────────

const mockUnsubscribe = vi.fn();
let mockAuthStateChangeCallback: ((event: string, session: object | null) => void) | null = null;

type ProfileResult = {
  data: {
    user_id: string;
    role: 'admin';
    company_id: null;
    full_name: string;
    is_active: boolean;
  };
  error: null;
};

const defaultProfileResult: ProfileResult = {
  data: {
    user_id: 'test-user',
    role: 'admin',
    company_id: null,
    full_name: 'Test User',
    is_active: true,
  },
  error: null,
};

const createMockSupabase = (
  initialSession: object | null,
  profileResult: PromiseLike<ProfileResult> | ProfileResult = defaultProfileResult
) => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: initialSession }, error: null }),
    onAuthStateChange: vi.fn().mockImplementation((callback) => {
      mockAuthStateChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      };
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn().mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockImplementation(() => profileResult),
  })),
});

let mockSupabase: ReturnType<typeof createMockSupabase>;

vi.mock('../db/supabase', () => ({
  get supabase() {
    return mockSupabase;
  },
}));

// ─── Test component ───────────────────────────────────────────────────────────

function TestConsumer() {
  const { loading, user, profile } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="user">{user ? user.id : 'null'}</div>
      <div data-testid="profile">{profile ? profile.role : 'null'}</div>
    </div>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthProvider loading state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStateChangeCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading only during initial auth check, not on token refresh', async () => {
    const mockUser = { id: 'test-user', email: 'test@example.com' };
    const mockSession = { user: mockUser };

    mockSupabase = createMockSupabase(mockSession);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Initially loading should be true
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // Wait for initial auth to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe('test-user');
    expect(screen.getByTestId('profile').textContent).toBe('admin');

    // Simulate a token refresh (auth state change with same session)
    const refreshedSession = { user: { ...mockUser, updated_at: Date.now() } };

    act(() => {
      mockAuthStateChangeCallback?.('TOKEN_REFRESHED', refreshedSession);
    });

    // Loading should remain false - no spinner should show
    expect(screen.getByTestId('loading').textContent).toBe('false');

    // User should be updated but without loading state
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test-user');
    });
  });

  it('shows loading while a newly signed-in user profile is loading', async () => {
    let resolveProfile: (result: ProfileResult) => void;
    const profileResult = new Promise<ProfileResult>((resolve) => {
      resolveProfile = resolve;
    });
    mockSupabase = createMockSupabase(null, profileResult);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    act(() => {
      mockAuthStateChangeCallback?.('SIGNED_IN', { user: { id: 'test-user' } });
    });

    expect(screen.getByTestId('loading').textContent).toBe('true');

    await act(async () => {
      resolveProfile!(defaultProfileResult);
      await profileResult;
    });
  });

  it('shows loading during initial auth check with no session', async () => {
    mockSupabase = createMockSupabase(null);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Initially loading should be true
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // Wait for initial auth to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('profile').textContent).toBe('null');
  });
});
