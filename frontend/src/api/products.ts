
import { supabase } from './supabase';

export async function getProducts() {
  return supabase.from('products').select('*');
}

export async function createProduct(params: {
  name: string;
  price: number;
  commission_percent: number;
  landing_url: string;
  brand_id: string;
}) {
  return supabase.from('products').insert(params);
}

export async function updateProduct(
  id: string,
  params: {
    name?: string;
    price?: number;
    commission_percent?: number;
    landing_url?: string;
    brand_id?: string;
  }
) {
  return supabase.from('products').update(params).eq('id', id);
}

export async function deleteProduct(id: string) {
  return supabase.from('products').delete().eq('id', id);
}
