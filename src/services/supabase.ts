import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe client-side Supabase initialization
let clientSupabase: SupabaseClient | null = null;

export function getClientSupabase(): SupabaseClient | null {
  if (clientSupabase) return clientSupabase;

  const env = (import.meta as any)?.env || {};
  const url = env.VITE_SUPABASE_URL || '';
  const anonKey = env.VITE_SUPABASE_ANON_KEY || '';

  if (url && anonKey && url.startsWith('http') && anonKey.length > 10 && !url.includes('your-project-id')) {
    try {
      clientSupabase = createClient(url, anonKey);
      console.log('[Supabase Client] Connected to', url);
    } catch (err) {
      console.warn('[Supabase Client Init Error]:', err);
    }
  }
  return clientSupabase;
}
