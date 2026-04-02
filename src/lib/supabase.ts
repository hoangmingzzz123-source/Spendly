import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f5f5b39c`;

// Supabase client for auth management — handles token refresh automatically
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Promise that resolves once the Supabase session has been restored on startup
let sessionRestoredResolve: () => void;
const sessionRestoredPromise = new Promise<void>((resolve) => {
  sessionRestoredResolve = resolve;
});
let sessionRestored = false;

// Call once on app mount to ensure Supabase has loaded its persisted session
export async function ensureSessionRestored() {
  if (sessionRestored) return;
  try {
    await supabase.auth.getSession();
  } catch {
    // ignore
  }
  sessionRestored = true;
  sessionRestoredResolve();
}

export function markLoginSuccess() {
  // Mark session as restored since we just logged in
  sessionRestored = true;
  sessionRestoredResolve();
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<any> {
  // Wait for the initial session restoration before making API calls
  if (!sessionRestored) {
    await sessionRestoredPromise;
  }

  // Always get token from Supabase client (source of truth for session)
  let token: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token ?? null;
  } catch {
    // ignore
  }

  const isAuthEndpoint = endpoint.startsWith('/auth/');
  
  // Build headers WITHOUT Authorization for non-auth endpoints that lack a token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only add Authorization header if:
  // 1. It's an auth endpoint (use publicAnonKey) OR
  // 2. We have a real access token (use it)
  if (isAuthEndpoint) {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  } else if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error(`[API] ❌ ${response.status} ${endpoint}`, error);

    // On 401, try once more after refreshing session
    if (response.status === 401 && !isAuthEndpoint && retryCount === 0) {
      console.warn('[API] 401 received, attempting session refresh and retry...');
      try {
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        if (refreshedSession?.access_token) {
          return apiRequest(endpoint, options, retryCount + 1);
        }
      } catch {
        // refresh failed
      }
      // No valid session — redirect to login
      console.warn('[API] No valid session after refresh, redirecting to login...');
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('spendly_user');
      } catch {}
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      return;
    }

    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}
