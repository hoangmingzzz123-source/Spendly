import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f5f5b39c`;

// Log API base for debugging
console.log('[Config] API_BASE:', API_BASE);
console.log('[Config] Project ID:', projectId);

// Expose project ID to window for diagnostic tools
if (typeof window !== 'undefined') {
  (window as any).projectId = projectId;
}

// Supabase client for auth management — handles token refresh automatically
// Use a unique storage key to avoid multiple instance warnings
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'spendly-auth', // Unique key to avoid conflicts
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
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

// Force clear all auth-related data from localStorage
export async function forceSignOut() {
  console.log('[Supabase] Force sign out - clearing all session data');
  
  // Sign out from Supabase (clears their internal storage)
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[Supabase] Error during signOut:', err);
  }
  
  // Manually clear all possible auth keys from localStorage
  try {
    const keysToRemove = [
      'access_token',
      'spendly_user',
      'spendly-auth', // New storage key
      'sb-access-token',
      'sb-refresh-token',
    ];
    
    // Clear known keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('[Supabase] ✅ Removed:', key);
    });
    
    // Also clear any Supabase auth keys (they use a specific pattern)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        console.log('[Supabase] ✅ Removing key:', key);
        localStorage.removeItem(key);
      }
    });
    
    console.log('[Supabase] ✅ All session data cleared');
  } catch (err) {
    console.error('[Supabase] Error clearing localStorage:', err);
  }
}

// Debug helper: Check current token status
export async function debugTokenStatus() {
  console.group('[Debug] Token Status');
  
  try {
    // 1. Check Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Supabase session:', session ? '✅ EXISTS' : '❌ NULL');
    console.log('Session error:', error ?? 'none');
    
    if (session?.access_token) {
      console.log('Token prefix:', session.access_token.substring(0, 30) + '...');
      console.log('Token expires at:', new Date(session.expires_at! * 1000).toISOString());
      console.log('Token expired:', session.expires_at! * 1000 < Date.now() ? '❌ YES' : '✅ NO');
      
      // Try to verify token locally
      const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);
      console.log('Token verification:', userError ? `❌ FAIL: ${userError.message}` : `✅ VALID for user ${user?.id}`);;
      
      // 2. Test backend validation
      console.log('\n[Testing backend token validation...]');
      try {
        const backendTest = await fetch(`${API_BASE}/debug/token`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        const backendData = await backendTest.json();
        console.log('Backend token test:', backendTest.ok ? '✅ VALID' : '❌ INVALID');
        console.log('Backend response:', backendData);
      } catch (backendErr) {
        console.error('❌ Backend test failed:', backendErr);
      }
    }
    
    // 3. Check localStorage
    const storedToken = localStorage.getItem('access_token');
    console.log('\nlocalStorage token:', storedToken ? '✅ EXISTS' : '❌ NULL');
    if (storedToken) {
      console.log('Stored token prefix:', storedToken.substring(0, 30) + '...');
      console.log('Tokens match:', storedToken === session?.access_token ? '✅ YES' : '❌ NO');
    }
    
    // 4. Check all localStorage keys
    const allKeys = Object.keys(localStorage);
    console.log('\nAll localStorage keys:', allKeys);
    
  } catch (err) {
    console.error('Debug failed:', err);
  }
  
  console.groupEnd();
}

// Expose to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).debugToken = debugTokenStatus;
  (window as any).clearAuth = forceSignOut;
  
  // Test backend env and token validation
  (window as any).testBackendEnv = async () => {
    console.log('🧪 Testing backend environment...');
    try {
      const response = await fetch(`${API_BASE}/debug/env`);
      const data = await response.json();
      console.log('Backend env:', data);
      return data;
    } catch (err) {
      console.error('Backend env test failed:', err);
    }
  };
  
  (window as any).testBackendToken = async () => {
    console.log('🧪 Testing backend token validation...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('❌ No token available');
        return;
      }
      
      console.log('Token prefix:', session.access_token.substring(0, 30) + '...');
      
      const response = await fetch(`${API_BASE}/debug/token`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      console.log('Backend token test:', data);
      return data;
    } catch (err) {
      console.error('Backend token test failed:', err);
    }
  };
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0,
  explicitToken?: string | null  // Allow passing explicit token for retry
): Promise<any> {
  // Wait for the initial session restoration before making API calls
  if (!sessionRestored) {
    await sessionRestoredPromise;
  }

  // Get token: use explicit token if provided (from refresh), otherwise get from session
  let token: string | null = explicitToken !== undefined ? explicitToken : null;
  
  if (token === null && explicitToken === undefined) {
    try {
      // CRITICAL FIX: getSession() can return stale session from memory cache
      // Force a fresh session check by calling getSession() with forceRefresh behavior
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error(`[API] Session error for ${endpoint}:`, error.message);
        // Clear stale localStorage on session error
        await forceSignOut();
      }
      
      token = session?.access_token ?? null;
      
      // Double-check: if no token from session, try localStorage as fallback
      if (!token) {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
          console.warn(`[API] ⚠️ Attempting fallback localStorage token for ${endpoint}`);
          // CRITICAL: Verify localStorage token before using it
          try {
            const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser(storedToken);
            if (verifyError || !verifiedUser) {
              console.error(`[API] ❌ localStorage token is invalid, clearing:`, verifyError?.message);
              await forceSignOut();
              token = null;
            } else {
              console.log(`[API] ✅ localStorage token verified successfully`);
              token = storedToken;
            }
          } catch (verifyException) {
            console.error(`[API] ❌ Token verification failed:`, verifyException);
            await forceSignOut();
            token = null;
          }
        } else {
          console.error(`[API] ❌ No token available for ${endpoint}. Session:`, session ? 'exists but no token' : 'null');
        }
      } else {
        console.log(`[API] ✅ Token retrieved for ${endpoint}, token prefix: ${token.substring(0, 30)}...`);
      }
    } catch (error) {
      console.error(`[API] Failed to get session for ${endpoint}:`, error);
      await forceSignOut();
    }
  } else if (explicitToken !== undefined) {
    console.log(`[API] Using explicit token for ${endpoint}: ${!!token}`);
  }

  // If no token and not auth endpoint, this is an error
  if (!token && !endpoint.startsWith('/auth/')) {
    console.error(`[API] ❌ CRITICAL: No access token for protected endpoint ${endpoint}!`);
    console.error(`[API] Redirecting to login due to missing token...`);
    // Force redirect to login
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
    throw new Error('No access token available for protected endpoint');
  }

  const isAuthEndpoint = endpoint.startsWith('/auth/');
  const authToken = (token && !isAuthEndpoint) ? token : publicAnonKey;

  const tokenPrefix = authToken.substring(0, 30) + '...';
  console.log(`[API] Request ${endpoint}, using ${token && !isAuthEndpoint ? 'access_token' : 'anon_key'}, retry: ${retryCount}, token prefix: ${tokenPrefix}`);

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

    // On 401, try once more after refreshing session
    if (response.status === 401 && !isAuthEndpoint && retryCount === 0) {
      console.warn('[API] 401 received, attempting session refresh and retry...');
      
      try {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('[API] Session refresh failed:', refreshError.message, refreshError.status);
          // If refresh fails, user needs to re-login - FORCE CLEAR ALL DATA
          console.warn('[API] Refresh failed, force clearing all session data...');
          await forceSignOut();
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
          return;
        } else if (refreshedSession?.access_token) {
          console.log('[API] ✅ Session refreshed successfully, new token prefix:', refreshedSession.access_token.substring(0, 30) + '...');
          // Persist the new token immediately
          try {
            localStorage.setItem('access_token', refreshedSession.access_token);
          } catch {}
          // Pass the new token explicitly to avoid race condition with session persistence
          return apiRequest(endpoint, options, retryCount + 1, refreshedSession.access_token);
        } else {
          console.error('[API] Refresh returned no session, force clearing...');
          await forceSignOut();
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
          return;
        }
      } catch (refreshException) {
        console.error('[API] Session refresh exception:', refreshException);
        // Redirect to login on exception
        await forceSignOut();
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