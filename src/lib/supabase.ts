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
    console.log('[API] Supabase session token:', sessionToken ? `${sessionToken.slice(0, 20)}...` : 'null');
  } catch (error) {
    console.warn('[API] Failed to read Supabase session:', error);
  }

  try {
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('access_token');
      console.log('[API] LocalStorage token:', localToken ? `${localToken.slice(0, 20)}...` : 'null');
      token = sessionToken || localToken;
      console.log('[API] Final token chosen:', token ? `${token.slice(0, 20)}...` : 'null');
    }
  } catch (error) {
    console.error('[API] Failed to access localStorage:', error);
  }
  
  // Skip auth endpoints (login, register) - but send anon key for Supabase functions
  const isAuthEndpoint = endpoint.startsWith('/auth/');
  
  // Debug logging - always log in development
  console.log(`[API] 📤 Request to: ${endpoint}, has access_token: ${!!token}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey, // Required for Supabase edge functions
    ...options.headers as Record<string, string>,
  };
  
  if (isAuthEndpoint) {
    // Auth endpoints: use Bearer token
    headers['Authorization'] = `Bearer ${token || publicAnonKey}`;
    console.log('[API] 🔑 Auth endpoint: using Authorization header');
  } else if (token) {
    // Protected endpoints: send token in BOTH headers
    // (Authorization may be stripped by Supabase edge runtime, so x-access-token is backup)
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-access-token'] = token;
    console.log('[API] ✅ Protected endpoint: token in Authorization + x-access-token');
  } else {
    // No user token: use publicAnonKey in Authorization
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
    console.log('[API] ⚠️  No user token: using publicAnonKey');
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error(`[API] ❌ Request FAILED: ${response.status} for ${endpoint}`, error);
    throw new Error(error.error || 'Request failed');
  }

  console.log(`[API] ✅ Request SUCCESS: ${endpoint}`);
  return response.json();
}