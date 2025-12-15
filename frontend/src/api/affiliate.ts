import { supabase } from './supabase';

export async function getAffiliateLinks() {
  return supabase.from('affiliate_links').select('id, code, product_id, affiliate_id');
}

export async function createAffiliateLink(product_id: string, code?: string) {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    return { data: null, error: { message: 'Utilisateur non authentifié.' } as any };
  }

  // ensure we have the affiliate id for the current user
  let { data: affiliate, error: affiliateErr } = await supabase
    .from('affiliates')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (affiliateErr) return { data: null, error: affiliateErr };

  // Si aucun affilié, on le crée à la volée (sécurité: RLS est désactivée côté DB)
  if (!affiliate) {
    const { data: created, error: createErr } = await supabase
      .from('affiliates')
      .insert({ user_id: userId, display_name: user.data.user?.email ?? 'Affilié' })
      .select('id')
      .limit(1)
      .maybeSingle();
    if (createErr) return { data: null, error: createErr };
    affiliate = created || null;
    if (!affiliate) {
      return { data: null, error: { message: 'Impossible de créer un affilié pour cet utilisateur.' } as any };
    }
  }

  const generatedCode = code && code.trim().length > 0
    ? code.trim()
    : `AFF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return supabase.from('affiliate_links').insert({
    affiliate_id: affiliate.id,
    product_id,
    code: generatedCode
  });
}

export async function deleteAffiliateLink(linkId: string) {
  const user = await supabase.auth.getUser();

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('user_id', user.data.user?.id)
    .single();

  if (!affiliate) {
    throw new Error('Aucun affilié trouvé pour cet utilisateur.');
  }

  return supabase
    .from('affiliate_links')
    .delete()
    .eq('id', linkId)
    .eq('affiliate_id', affiliate.id);
}

