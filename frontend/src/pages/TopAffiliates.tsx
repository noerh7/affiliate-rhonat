import { useEffect, useMemo, useState } from 'react';
import { getTopAffiliates } from '../api/affiliates';
import AffiliateRankCard from '../components/marketplace/AffiliateRankCard';
import Sidebar from '../components/Sidebar';

export default function TopAffiliates() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTopAffiliates().then(({ data, error }) => {
      if (error) setError(error.message);
      setList(data ?? []);
      setLoading(false);
    });
  }, []);

  const topClicks = useMemo(
    () => [...list].sort((a, b) => (b.clicks_count || 0) - (a.clicks_count || 0)).slice(0, 10),
    [list]
  );
  const topSales = useMemo(
    () => [...list].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 10),
    [list]
  );
  const topRevenue = useMemo(
    () => [...list].sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0)).slice(0, 10),
    [list]
  );

  function renderSimpleList(items: any[], metricKey: 'clicks_count' | 'sales_count' | 'total_revenue', label: string) {
    return (
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">{label}</h2>
          <span className="text-sm text-gray-500">Top 10</span>
        </div>
        {items.length === 0 ? (
          <div className="p-4 text-gray-600">Pas encore de données. Commence à générer des ventes/clics.</div>
        ) : (
          <ol className="divide-y">
            {items.map((a, idx) => (
              <li key={a.affiliate_id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-gray-500">{idx + 1}.</span>
                  <span className="font-semibold">{a.display_name || 'Anonyme'}</span>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {metricKey === 'total_revenue' ? `${a[metricKey] ?? 0}€` : a[metricKey] ?? 0}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Top affiliés</h1>
        {loading && <div className="text-gray-600">Chargement du classement…</div>}
        {!loading && error && (
          <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">{error}</div>
        )}
        {!loading && !error && list.length === 0 && (
          <div className="bg-white p-4 rounded shadow text-gray-600">
            Pas encore de top affiliés. Commence à générer des ventes pour apparaître ici.
          </div>
        )}

        {!loading && !error && list.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {renderSimpleList(topClicks, 'clicks_count', 'Classement par clics')}
            {renderSimpleList(topSales, 'sales_count', 'Classement par ventes')}
            {renderSimpleList(topRevenue, 'total_revenue', 'Classement par chiffre d’affaires')}
          </div>
        )}

        {!loading && !error && list.length > 0 && (
          <div className="flex flex-col gap-4">
            {list.slice(0, 10).map((a) => (
              <AffiliateRankCard key={a.affiliate_id} a={a} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
