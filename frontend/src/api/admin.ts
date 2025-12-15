import { supabase } from './supabase';

export type AdminAggregates = {
  by_brand: Array<{ brand_id: string; brand_name: string; clicks: number; sales: number; revenue: number }>;
  by_product: Array<{ product_id: string; product_name: string; brand_id: string; clicks: number; sales: number; revenue: number }>;
  by_affiliate: Array<{ affiliate_id: string; display_name: string; user_id: string; clicks: number; sales: number; revenue: number }>;
};

export async function getAdminAggregates() {
  const { data, error } = await supabase.rpc('admin_aggregates');
  if (error) return { data: null, error };
  return { data: data as AdminAggregates, error: null };
}







