import { supabase } from './supabase';

export async function getSalesStats() {
  return supabase.rpc('get_affiliate_stats');
}

