
import { useEffect, useState } from 'react';
import { getAffiliateStats } from '../api/stats';

export function useStats() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const { data, error: apiError } = await getAffiliateStats();
        
        if (apiError) {
          setError(apiError.message || 'Erreur lors du chargement des statistiques');
          console.error('Stats API error:', apiError);
        } else {
          setStats(data);
        }
      } catch (err: any) {
        const errorMessage = err?.message || 'Erreur de connexion';
        setError(errorMessage);
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  return { stats, loading, error };
}
