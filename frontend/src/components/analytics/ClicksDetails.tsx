import { useEffect, useState } from 'react';
import { getClicksDetails } from '../../api/stats';

interface ClickDetail {
  id: number;
  created_at: string;
  date: string;
  time: string;
  product_name: string;
  product_id: string;
  brand_name: string;
  link_code: string;
  link_url: string;
  landing_url: string;
  ip: string | null;
  user_agent: string | null;
  referer: string | null;
  accept_language: string | null;
}

export default function ClicksDetails() {
  const [clicks, setClicks] = useState<ClickDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(50);

  const fetchClicks = async (offset: number) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await getClicksDetails(limit, offset);
      
      if (apiError) {
        setError(apiError.message || 'Erreur lors du chargement des clics');
        console.error('Clicks details error:', apiError);
      } else if (data) {
        setClicks(data.clicks || []);
        setTotal(data.total || 0);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
      console.error('Clicks fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClicks(page * limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  const getFullLinkUrl = (code: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/go/${code}`;
  };

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getBrowserFromUserAgent = (userAgent: string | null) => {
    if (!userAgent) return '-';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return truncateText(userAgent, 30);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white p-6 shadow rounded">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Détails des Clics</h2>
        {total > 0 && (
          <span className="text-sm text-gray-500">
            {total} clic{total > 1 ? 's' : ''} au total
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <strong>Erreur :</strong> {error}
          {error.includes('migration SQL') && (
            <div className="mt-2 text-xs">
              <p className="font-semibold">Solution :</p>
              <p>Exécutez la migration SQL 09_clicks_details.sql dans votre base de données Supabase.</p>
            </div>
          )}
          {error.includes('bloquée par une extension') && (
            <div className="mt-2 text-xs">
              <p className="font-semibold">Solution :</p>
              <p>Désactivez temporairement les bloqueurs de publicité ou extensions de sécurité.</p>
            </div>
          )}
        </div>
      )}

      {loading && clicks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : clicks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun clic enregistré pour le moment.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marque
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code Lien
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL Destination
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Navigateur
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clicks.map((click) => (
                  <tr key={click.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="font-medium">{formatDate(click.date)}</div>
                      <div className="text-gray-500">{formatTime(click.time)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{click.product_name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {click.brand_name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={getFullLinkUrl(click.link_code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                        title={getFullLinkUrl(click.link_code)}
                      >
                        {click.link_code}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={click.landing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title={click.landing_url}
                      >
                        {truncateText(click.landing_url, 40)}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                      {click.ip || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-xs">
                      {click.referer ? (
                        <a
                          href={click.referer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title={click.referer}
                        >
                          {truncateText(click.referer, 30)}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-xs" title={click.user_agent || ''}>
                      {getBrowserFromUserAgent(click.user_agent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {page + 1} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0 || loading}
                  className="px-4 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1 || loading}
                  className="px-4 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

