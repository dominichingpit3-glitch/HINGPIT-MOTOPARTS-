import { createClient, SupabaseClient } from '@supabase/supabase-js';

let clientSupabase: SupabaseClient | null = null;

export function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?.*$/i, '').replace(/\/auth\/v1\/?.*$/i, '').replace(/\/+$/, '');
  return url;
}

export function getClientSupabase(forceRefresh: boolean = false): SupabaseClient | null {
  if (clientSupabase && !forceRefresh) return clientSupabase;

  const env = (import.meta as any)?.env || {};
  let url = cleanSupabaseUrl(env.VITE_SUPABASE_URL || '');
  let anonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

  // Check localStorage for user-provided credentials
  try {
    const stored = localStorage.getItem('motoparts_supabase_credentials');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.key) {
        url = cleanSupabaseUrl(parsed.url);
        anonKey = (parsed.key || '').trim();
      }
    }
  } catch (e) {
    // ignore
  }

  // Default to user's provided Supabase if not configured
  if (!url || url.includes('your-project-id')) {
    url = 'https://reilurkdveaghluryfhz.supabase.co';
    anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaWx1cmtkdmVhZ2hsdXJ5Zmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODUxNDksImV4cCI6MjEwMzU2MTE0OX0.gZ-VEA3uGW7gfn0zszuYZty5jzE_VIe7YB4msEx21iU';
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
    const cleaned = cleanSupabaseUrl(url);
    localStorage.setItem('motoparts_supabase_credentials', JSON.stringify({ url: cleaned, key: key.trim() }));
    clientSupabase = null;
    getClientSupabase(true);
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}
