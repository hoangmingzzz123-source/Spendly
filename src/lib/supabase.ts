import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f5f5b39c`;

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  let token = null;
  try {
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }
  } catch (error) {
    console.error('[API] Failed to access localStorage:', error);
  }
  
  // Skip auth endpoints (login, register)
  const isAuthEndpoint = endpoint.startsWith('/auth/');
  
  // Debug logging - always log in development
  console.log(`[API] 📤 Request to: ${endpoint}, has access_token: ${!!token}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  // ✅ FIX: Always send Authorization header (even for non-auth endpoints without token)
  // This matches original behavior and prevents "Missing authorization header" error
  if (token) {
    // User is authenticated - use their access token
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API] ✅ Using access_token');
  } else if (!isAuthEndpoint) {
    // User not authenticated but endpoint requires auth - use publicAnonKey as fallback
    // Server will respond with "Invalid JWT token" instead of "Missing header"
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
    console.log('[API] ⚠️ Using publicAnonKey fallback (will get Invalid JWT error)');
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });


  if (!response.ok) {
    let error = { error: 'Request failed' };
    try {
      error = await response.json();
    } catch {}
    console.error(`[API] ❌ Request FAILED: ${response.status} for ${endpoint}`, error);

    // Nếu token hết hạn hoặc lỗi xác thực, redirect về login
    if (
      response.status === 401 ||
      (typeof error.error === 'string' &&
        (error.error.toLowerCase().includes('jwt') ||
         error.error.toLowerCase().includes('token')))
    ) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    throw new Error(error.error || 'Request failed');
  }

  console.log(`[API] ✅ Request SUCCESS: ${endpoint}`);
  return response.json();
}