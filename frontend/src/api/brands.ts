import { supabase } from './supabase';

export async function getBrands() {
  return supabase.from('brands').select('id, name');
}

export async function createBrand(params: { name: string; domain: string }) {
  return supabase.from('brands').insert(params);
}
