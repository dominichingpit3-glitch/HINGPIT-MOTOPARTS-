import { createClient, SupabaseClient } from '@supabase/supabase-js';

let clientSupabase: SupabaseClient | null = null;

export function getClientSupabase(forceRefresh: boolean = false): SupabaseClient | null {
  if (clientSupabase && !forceRefresh) return clientSupabase;

  const env = (import.meta as any)?.env || {};
  let url = env.VITE_SUPABASE_URL || '';
  let anonKey = env.VITE_SUPABASE_ANON_KEY || '';

  // Check localStorage for user-provided credentials
  if (!url || url.includes('your-project-id')) {
    try {
      const stored = localStorage.getItem('motoparts_supabase_credentials');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.key) {
          url = parsed.url;
          anonKey = parsed.key;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (url && anonKey && url.startsWith('http') && anonKey.length > 10 && !url.includes('your-project-id')) {
    try {
      clientSupabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      console.log('[Supabase Client] Connected to', url);
    } catch (err) {
      console.warn('[Supabase Client Init Error]:', err);
      clientSupabase = null;
    }
  }
  return clientSupabase;
}

export function saveClientSupabaseCredentials(url: string, key: string) {
  try {
    localStorage.setItem('motoparts_supabase_credentials', JSON.stringify({ url: url.trim(), key: key.trim() }));
    clientSupabase = null;
    getClientSupabase(true);
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}
