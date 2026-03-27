import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f5f5b39c`;

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  let token: string | null = null;
  let sessionToken: string | null = null;

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    sessionToken = session?.access_token ?? null;
  } catch (error) {
    console.warn('[API] Failed to read session:', error);
  }

  try {
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('access_token');
      token = sessionToken || localToken;
    }
  } catch (error) {
    console.error('[API] Failed to access localStorage:', error);
  }
  
  const isAuthEndpoint = endpoint.startsWith('/auth/');
  
  console.log(`[API] 📤 ${endpoint} - token: ${token ? 'yes' : 'no'}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey,
    ...options.headers as Record<string, string>,
  };
  
  // Build URL with token in query param (since Supabase strips custom headers)
  let url = `${API_BASE}${endpoint}`;
  const separator = endpoint.includes('?') ? '&' : '?';
  
  if (isAuthEndpoint) {
    headers['Authorization'] = `Bearer ${token || publicAnonKey}`;
    console.log('[API] 🔑 Auth endpoint');
  } else if (token) {
    // Add token as query parameter for protected endpoints
    url += `${separator}token=${encodeURIComponent(token)}`;
    console.log('[API] ✅ Token sent via query parameter');
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
    console.log('[API] ⚠️  No user token');
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error(`[API] ❌ ${response.status} ${endpoint}`, error);
    throw new Error(error.error || 'Request failed');
  }

  console.log(`[API] ✅ ${endpoint}`);
  return response.json();
}