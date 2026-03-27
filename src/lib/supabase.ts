import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f5f5b39c`;

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  let token = null;
  const {
    data: { session }
  } = await supabase.auth.getSession();


  try {
    if (typeof window !== 'undefined') {
      // token = localStorage.getItem('access_token');
       token = session?.access_token;
       console.log('[API] Retrieved token from session:', token);
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
  
  // For auth endpoints, send anon key as Supabase functions may require it
  if (isAuthEndpoint) {
    headers['Authorization'] = `Bearer ${token || publicAnonKey}`;
    console.log('[API] 🔑 Using publicAnonKey for auth endpoint');
  } else if (token) {
    // For protected endpoints, use access token
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API] ✅ Using access_token');
  }
  // apikey header is always included above
  
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