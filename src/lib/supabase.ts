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

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isUsableAccessToken(token: string | null): token is string {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const payload = parseJwtPayload(token);
  if (!payload) return false;

  // Reject tokens from another Supabase project (common after env/project switches).
  if (payload.ref && payload.ref !== projectId) return false;

  // Reject expired tokens early to avoid hitting gateway with invalid JWT.
  if (typeof payload.exp === 'number') {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return false;
  }

  return true;
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0,
  forcedToken: string | null = null
): Promise<any> {
  // Wait for the initial session restoration before making API calls
  if (!sessionRestored) {
    await sessionRestoredPromise;
  }

  // Always get token from Supabase client (source of truth for session)
  let token: string | null = null;
  if (forcedToken) {
    token = forcedToken;
  } else {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token ?? null;
    } catch {
      // ignore
    }
  }

  const isAuthEndpoint = endpoint.startsWith('/auth/');

  if (!isAuthEndpoint && token && !isUsableAccessToken(token)) {
    console.warn('[API] Ignoring unusable access token (stale/invalid/wrong project).');
    token = null;
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    'Content-Type': 'application/json',
    // Send Supabase API token (anon key) for function gateway routing.
    apikey: publicAnonKey,
  };

  if (!isAuthEndpoint && token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Keep Authorization present so the Supabase function gateway does not reject the request.
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
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
          return apiRequest(endpoint, options, retryCount + 1, refreshedSession.access_token);
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
