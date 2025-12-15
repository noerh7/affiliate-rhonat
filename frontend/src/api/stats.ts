
import { supabase } from './supabase';

export async function getAffiliateStats() {
  try {
    // Utilise le nouvel endpoint pour éviter les bloqueurs sur le mot "analytics"
    const { data, error } = await supabase.rpc('get_affiliate_stats_enriched');
    
    if (error) {
      console.error('RPC error:', error);
      
      // Vérifier si c'est une erreur de fonction non trouvée
      if (error.message?.includes('function') || error.code === '42883' || error.code === 'P0001') {
        return { 
          data: null, 
          error: { 
            message: 'La fonction get_affiliate_stats_enriched n\'existe pas. Veuillez exécuter la migration SQL 06_rename_affiliate_stats.sql',
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
    console.error('Stats API catch error:', err);
    
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

export async function getClicksDetails(limit: number = 100, offset: number = 0) {
  try {
    const { data, error } = await supabase.rpc('get_affiliate_clicks_details', {
      limit_count: limit,
      offset_count: offset
    });
    
    if (error) {
      console.error('Clicks details RPC error:', error);
      
      // Vérifier si c'est une erreur de fonction non trouvée
      if (error.message?.includes('function') || error.code === '42883' || error.code === 'P0001') {
        return { 
          data: null, 
          error: { 
            message: 'La fonction get_affiliate_clicks_details n\'existe pas. Veuillez exécuter la migration SQL 09_clicks_details.sql',
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
    console.error('Clicks details API catch error:', err);
    
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
