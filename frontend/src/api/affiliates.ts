import { supabase } from './supabase';

export async function getTopAffiliates() {
  return supabase.from('top_affiliates').select('*').limit(50);
}

export async function getAffiliateLinksDetails(affiliateId: string) {
  try {
    const { data, error } = await supabase.rpc('get_affiliate_links_details', {
      target_affiliate_id: affiliateId
    });
    
    if (error) {
      console.error('Affiliate links details RPC error:', error);
      
      // Vérifier si c'est une erreur de fonction non trouvée
      if (error.message?.includes('function') || error.code === '42883' || error.code === 'P0001') {
        return { 
          data: null, 
          error: { 
            message: 'La fonction get_affiliate_links_details n\'existe pas. Veuillez exécuter la migration SQL 10_affiliate_links_details.sql',
            code: 'FUNCTION_NOT_FOUND',
            details: error 
          } 
        };
      }
      
      // Vérifier si c'est un blocage par extension
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        return { 
          data: null, 
          error: { 
            message: 'Requête bloquée par une extension de navigateur. Désactivez les bloqueurs de publicité ou extensions de sécurité.',
            code: 'BLOCKED_BY_CLIENT',
            details: error 
          } 
        };
      }
      
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Affiliate links details API catch error:', err);
    
    // Vérifier si c'est un blocage par extension
    if (err?.message?.includes('Failed to fetch') || err?.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      return { 
        data: null, 
        error: { 
          message: 'Requête bloquée par une extension de navigateur. Désactivez les bloqueurs de publicité ou extensions de sécurité.',
          code: 'BLOCKED_BY_CLIENT',
          details: err 
        } 
      };
    }
    
    return { 
      data: null, 
      error: { 
        message: err?.message || 'Erreur de connexion au serveur',
        details: err 
      } 
    };
  }
}

