
import { supabase } from './supabase';

export async function getAffiliateLinks() {
  return supabase.from('affiliate_links').select('id, code, product_id, affiliate_id');
}

export async function getAffiliateLinkDetail(id: string) {
  return supabase
    .from('affiliate_links')
    .select(
      `
        id,
        code,
        created_at,
        product:products (
          id,
          name,
          price,
          commission_percent,
          landing_url,
          brand:brands (
            id,
            name,
            domain
          )
        ),
        affiliate:affiliates (
          id,
          display_name
        )
      `
    )
    .eq('id', id)
    .single();
}
