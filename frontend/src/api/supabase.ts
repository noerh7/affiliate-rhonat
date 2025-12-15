
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Supabase env vars are missing. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(url, key);

// Exposed for debugging (sanitised to avoid leaking the full key).
export const supabaseEnvInfo = {
  url,
  anonKeyPreview: key ? `${key.slice(0, 6)}...${key.slice(-4)}` : null,
};
