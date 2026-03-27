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
  
  // Debug logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[API] Request to ${endpoint}, has token: ${!!token}`);
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  // Only send Authorization header if we have a real access token
  // Do NOT send publicAnonKey as Bearer token (it's not an access token)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error(`[API] Request failed: ${response.status} ${response.statusText}`, error);
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}