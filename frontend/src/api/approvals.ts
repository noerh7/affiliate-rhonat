import { supabase } from './supabase';

export async function requestApproval(product_id: string) {
  const user = await supabase.auth.getUser();
  return supabase.from('affiliate_approvals').insert({ 
    affiliate_id: user.data.user?.id, 
    product_id 
  });
}

export async function getApprovals() {
  const user = await supabase.auth.getUser();
  return supabase
    .from('affiliate_approvals')
    .select('*')
    .eq('affiliate_id', user.data.user?.id);
}

