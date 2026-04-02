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

// Track last login time to prevent immediate auto-logout after login
let lastLoginTime = 0;
const LOGIN_GRACE_PERIOD = 5000; // 5 seconds

// Module-level token cache — set synchronously after login, always fresh
let cachedAccessToken: string | null = null;

export function markLoginSuccess() {
  lastLoginTime = Date.now();
}

export function setCachedToken(token: string | null) {
  cachedAccessToken = token;
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<any> {
  // Use the cached token first (set synchronously after login), then fall back to getSession
  let token: string | null = cachedAccessToken;
  if (!token) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token ?? null;
    } catch {
      try {
        token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      } catch {
        token = null;
      }
    }
  }

  const isAuthEndpoint = endpoint.startsWith('/auth/');
  const authToken = (token && !isAuthEndpoint) ? token : publicAnonKey;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...(options.headers as Record<string, string> || {}),
    },
  });


  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error(`[API] ❌ ${response.status} ${endpoint}`, error);

    // Auto-logout on invalid/expired JWT (but not on auth endpoints or during grace period)
    if (response.status === 401 && !isAuthEndpoint) {
      const timeSinceLogin = Date.now() - lastLoginTime;
      const isInGracePeriod = timeSinceLogin < LOGIN_GRACE_PERIOD;

      if (isInGracePeriod && retryCount === 0) {
        console.warn('[API] 401 during grace period after login, retrying once...');
        await new Promise(resolve => setTimeout(resolve, 800));
        return apiRequest(endpoint, options, retryCount + 1);
      } else if (!isInGracePeriod) {
        console.warn('[API] Token expired or invalid, logging out...');
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('spendly_user');
        } catch {}
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        return;
      }
    }

    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}