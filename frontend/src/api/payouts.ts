import { supabase } from './supabase';

export async function getPayoutMethods() {
  const user = await supabase.auth.getUser();
  return supabase
    .from('affiliate_payout_methods')
    .select('*')
    .eq('affiliate_id', user.data.user?.id);
}

export async function requestPayout(amount: number) {
  const user = await supabase.auth.getUser();
  return supabase.from('affiliate_payouts').insert({
    affiliate_id: user.data.user?.id,
    amount,
    method: 'paypal'
  });
}

export async function getPayoutHistory() {
  const user = await supabase.auth.getUser();
  return supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', user.data.user?.id)
    .order('created_at', { ascending: false });
}

export function exportPayoutsCSV(payouts: any[]) {
  const rows = [
    ['Date', 'Montant', 'Méthode', 'Statut'],
    ...payouts.map(p => [p.created_at, p.amount, p.method, p.status])
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'payouts.csv';
  a.click();
}
