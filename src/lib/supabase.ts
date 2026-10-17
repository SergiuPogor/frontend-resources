import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Lazily creates the Supabase client. Returns null when env vars are missing
 * (local dev, preview builds) so the UI degrades to "likes unavailable"
 * instead of throwing at import time during prerender.
 */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client =
    url && anonKey
      ? createClient(url, anonKey, { auth: { persistSession: true } })
      : null;
  return client;
}
