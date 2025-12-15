import { useState } from 'react';
import { getAffiliateLinksDetails } from '../../api/affiliates';

interface LinkDetail {
  link_id: string;
  link_code: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_commission_percent: number;
  product_landing_url: string;
  brand_name: string;
  clicks_count: number;
  sales_count: number;
  total_revenue: number;
  epc: number;
  created_at: string;
}

export default function AffiliateRankCard({ a }: { a: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [linksDetails, setLinksDetails] = useState<LinkDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (!isExpanded && linksDetails.length === 0) {
      // Charger les détails si pas encore chargés
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await getAffiliateLinksDetails(a.affiliate_id);
      
      if (apiError) {
        setError(apiError.message || 'Erreur lors du chargement des détails');
        console.error('Error loading links details:', apiError);
      } else {
        setLinksDetails(data || []);
      }
      setLoading(false);
    }
    setIsExpanded(!isExpanded);
  };

  const getFullLinkUrl = (code: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/go/${code}`;
  };

  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">{a.display_name || 'Anonyme'}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">{a.clicks_count || 0} clics</span>
          <span className="font-medium">{a.total_revenue}€</span>
          <span className="text-gray-600">{a.sales_count} ventes</span>
          <span className="text-gray-600">{a.epc || 0}€ EPC</span>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {loading && (
            <div className="text-center py-4 text-gray-500">Chargement des détails...</div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              <strong>Erreur :</strong> {error}
              {error.includes('migration SQL') && (
                <div className="mt-2 text-xs">
                  <p className="font-semibold">Solution :</p>
                  <p>Exécutez la migration SQL 10_affiliate_links_details.sql dans votre base de données Supabase.</p>
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

          {!loading && !error && linksDetails.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Aucun lien d'affiliation trouvé pour cet affilié.
            </div>
          )}

          {!loading && !error && linksDetails.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">
                Liens d'affiliation ({linksDetails.length})
              </h3>
              {linksDetails.map((link) => (
                <div
                  key={link.link_id}
                  className="bg-white p-4 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{link.product_name}</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {link.brand_name}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Code:</span>
                          <a
                            href={getFullLinkUrl(link.link_code)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {link.link_code}
                          </a>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Destination:</span>
                          <a
                            href={link.product_landing_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs truncate max-w-md"
                            onClick={(e) => e.stopPropagation()}
                            title={link.product_landing_url}
                          >
                            {link.product_landing_url.length > 50 
                              ? link.product_landing_url.substring(0, 50) + '...'
                              : link.product_landing_url}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-sm">
                      <div className="grid grid-cols-2 gap-3 text-right">
                        <div>
                          <div className="text-xs text-gray-500">Clics</div>
                          <div className="font-semibold text-gray-900">{link.clicks_count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Ventes</div>
                          <div className="font-semibold text-gray-900">{link.sales_count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Revenus</div>
                          <div className="font-semibold text-green-600">{link.total_revenue}€</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">EPC</div>
                          <div className="font-semibold text-gray-900">{link.epc}€</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-1">
                        Commission: {link.product_commission_percent}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

