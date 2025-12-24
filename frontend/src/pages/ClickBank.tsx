import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

interface ClickData {
  trackingId: string;
  vendor?: string;
  hops: number;
  sales: number;
  refunds: number;
  chargebacks: number;
  earnings: number;
  [key: string]: any;
}

interface AnalyticsResponse {
  data: ClickData[];
  period: {
    startDate: string;
    endDate: string;
  };
}

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  trackingId?: string;
  account?: string;
  dimension?: 'vendor' | 'TRACKING_ID';
  select?: string;
  role?: 'AFFILIATE' | 'VENDOR';
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function normalizeAnalyticsPayload(payload: any): ClickData[] {
  if (!payload) return [];

  let rows: any[] = [];

  if (payload.rows?.row) {
    rows = Array.isArray(payload.rows.row) ? payload.rows.row : (payload.rows.row ? [payload.rows.row] : []);
  } else if (Array.isArray(payload)) {
    rows = payload;
  } else if (Array.isArray(payload.data)) {
    rows = payload.data;
  } else if (Array.isArray(payload.analytics)) {
    rows = payload.analytics;
  } else if (Array.isArray(payload.analytics?.data)) {
    rows = payload.analytics.data;
  } else if (Array.isArray(payload.rows)) {
    rows = payload.rows;
  }

  return rows.map((row: any) => {
    const dimensionValue = row.dimensionValue || row.trackingId || row.tracking_id || row.tid || row.tracking || '';
    const dataArray = row.data || [];

    const metrics: any = {};
    if (Array.isArray(dataArray)) {
      dataArray.forEach((item: any) => {
        if (item.attribute && item.value) {
          const value = typeof item.value === 'object' && item.value.$ !== undefined
            ? item.value.$
            : item.value;
          metrics[item.attribute.toLowerCase()] = Number(value) || 0;
        }
      });
    }

    return {
      trackingId: dimensionValue,
      vendor: row.dimensionValue || dimensionValue,
      hops: Number(metrics.hop_count ?? row.hops ?? row.clicks ?? row.hopCount ?? 0),
      sales: Number(metrics.sale_count ?? row.sales ?? row.saleCount ?? 0),
      refunds: Number(row.refunds ?? row.refundCount ?? 0),
      chargebacks: Number(row.chargebacks ?? row.chargebackCount ?? 0),
      earnings: Number(row.earnings ?? row.amount ?? row.revenue ?? 0),
      ...row,
      ...metrics,
    };
  });
}

async function getClicksAnalytics(
  apiKey: string,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsResponse> {
  // Backend déployé sur Vercel (URL en dur)
  const BACKEND_URL = 'https://affiliate-rhonat-delta.vercel.app';

  // Construire la clé API avec le préfixe API-
  const formattedApiKey = apiKey.startsWith('API-') ? apiKey : `API-${apiKey}`;

  // Construction des paramètres de requête pour le backend
  const params = new URLSearchParams();

  // Paramètres obligatoires
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  // Paramètres optionnels avec valeurs par défaut
  params.append('role', filters.role || 'AFFILIATE');
  params.append('dimension', filters.dimension || 'TRACKING_ID');
  params.append('select', filters.select || 'HOP_COUNT,SALE_COUNT');

  // Account (requis pour dimension vendor)
  if (filters.account) {
    params.append('account', filters.account);
  } else if ((filters.dimension || 'TRACKING_ID').toLowerCase() === 'vendor') {
    params.append('account', 'freenzy');
  }

  // URL complète vers le backend
  const url = `${BACKEND_URL}/api/clickbank/analytics?${params.toString()}`;

  console.log('[ClickBank Backend] Calling:', url);
  console.log('[ClickBank Backend] Params:', Object.fromEntries(params));

  try {
    // Appel au backend Vercel avec l'API key dans les headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': formattedApiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('[ClickBank Backend] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ClickBank Backend] Error response:', errorText);
      throw new Error(`Backend API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('[ClickBank Backend] Response data:', result);

    // Le backend retourne { success: true, data: {...} }
    const payload = result.success ? result.data : result;

    // Normaliser la réponse
    const clickDataArray = normalizeAnalyticsPayload(payload);

    return {
      data: clickDataArray,
      period: {
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
      },
    };
  } catch (error) {
    console.error('[ClickBank Backend] Error fetching analytics:', error);
    throw error;
  }
}

function getDefaultDateRange(days = 7) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { start: format(start), end: format(end) };
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function Clickbank() {
  const { t } = useTranslation();
  const defaultRange = getDefaultDateRange();
  // API Key gérée en interne
  const developerKey = 'API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT';

  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  // États pour les statistiques de clics
  const [loadingClicks, setLoadingClicks] = useState(false);
  const [clicksData, setClicksData] = useState<AnalyticsResponse | null>(null);


  // États pour les formulaires
  const [analyticsFilters, setAnalyticsFilters] = useState({
    startDate: defaultRange.start,
    endDate: defaultRange.end,
    trackingId: '',
    select: 'HOP_COUNT,SALE_COUNT',
    dimension: 'vendor',
    account: 'freenzy',
  });



  async function handleGetClicks() {
    if (!developerKey) {
      setToast({ message: 'Veuillez entrer votre Developer API Key', type: 'error' });
      return;
    }
    if (!analyticsFilters.startDate || !analyticsFilters.endDate) {
      setToast({ message: 'Veuillez définir une date de début et de fin.', type: 'error' });
      return;
    }
    const dimension = analyticsFilters.dimension || 'TRACKING_ID';
    const account = analyticsFilters.account?.trim();
    if (dimension.toLowerCase() === 'vendor' && !account) {
      setToast({ message: 'Veuillez renseigner un account (vendor) pour la dimension vendor.', type: 'error' });
      return;
    }
    const metrics = analyticsFilters.select?.trim() || 'HOP_COUNT,SALE_COUNT';

    setLoadingClicks(true);
    setClicksData(null);

    try {
      const filters: AnalyticsFilters = {};
      if (analyticsFilters.startDate) filters.startDate = analyticsFilters.startDate;
      if (analyticsFilters.endDate) filters.endDate = analyticsFilters.endDate;
      if (analyticsFilters.trackingId) filters.trackingId = analyticsFilters.trackingId;
      if (metrics) filters.select = metrics;
      if (dimension) filters.dimension = dimension.toUpperCase() as 'vendor' | 'TRACKING_ID';
      if (account) filters.account = account;

      const response = await getClicksAnalytics(developerKey, {
        role: 'AFFILIATE',
        ...filters,
      });

      setClicksData(response);
      setToast({
        message: `Statistiques récupérées pour ${response.data.length} Tracking ID(s)`,
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        message: `Erreur: ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoadingClicks(false);
    }
  }


  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`p-4 rounded-lg ${toast.type === 'error' ? 'bg-red-50 text-red-800' :
          toast.type === 'success' ? 'bg-green-50 text-green-800' :
            'bg-blue-50 text-blue-800'
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-sm font-medium hover:underline">
              Fermer
            </button>
          </div>
        </div>
      )}


      {/* Section Statistiques de clics */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Statistiques de clics</h2>
            <p className="text-sm text-gray-600">Récupérez les détails des clics par Tracking ID</p>
          </div>
          <button
            onClick={handleGetClicks}
            disabled={loadingClicks || !developerKey}
            className="btn-primary text-sm"
          >
            {loadingClicks ? t('common.loading') : t('clickbank.clickStats')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Date de début (yyyy-mm-dd)</span>
            <input
              type="date"
              className="input"
              value={analyticsFilters.startDate}
              onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, startDate: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Date de fin (yyyy-mm-dd)</span>
            <input
              type="date"
              className="input"
              value={analyticsFilters.endDate}
              onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, endDate: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Dimension</span>
            <select
              className="input"
              value={analyticsFilters.dimension}
              onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, dimension: e.target.value })}
            >
              <option value="vendor">vendor</option>
              <option value="TRACKING_ID">TRACKING_ID</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              Account (vendor) — requis pour la dimension vendor
            </span>
            <input
              className="input"
              placeholder="ex: freenzy"
              value={analyticsFilters.account}
              onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, account: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Metrics (select)</span>
            <input
              className="input"
              placeholder="HOP_COUNT,SALE_COUNT"
              value={analyticsFilters.select}
              onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, select: e.target.value })}
            />
          </label>
        </div>
        {clicksData && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Résultats ({clicksData.data.length} Vendor(s))</h3>
              <div className="text-xs text-gray-500">
                Période: {clicksData.period.startDate} → {clicksData.period.endDate}
              </div>
            </div>

            {/* Statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs text-blue-600 font-medium mb-1">Total Clics</div>
                <div className="text-2xl font-bold text-blue-700">
                  {clicksData.data.reduce((sum, item) => sum + item.hops, 0)}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-xs text-green-600 font-medium mb-1">Total Ventes</div>
                <div className="text-2xl font-bold text-green-700">
                  {clicksData.data.reduce((sum, item) => sum + item.sales, 0)}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-xs text-purple-600 font-medium mb-1">Taux de Conversion</div>
                <div className="text-2xl font-bold text-purple-700">
                  {(() => {
                    const totalHops = clicksData.data.reduce((sum, item) => sum + item.hops, 0);
                    const totalSales = clicksData.data.reduce((sum, item) => sum + item.sales, 0);
                    return totalHops > 0 ? ((totalSales / totalHops) * 100).toFixed(2) : '0.00';
                  })()}%
                </div>
              </div>
            </div>

            {/* Tableau des résultats */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Vendor</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Clics</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Ventes</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Taux Conv.</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Revenus</th>
                  </tr>
                </thead>
                <tbody>
                  {clicksData.data.map((item, index) => {
                    const conversionRate = item.hops > 0 ? ((item.sales / item.hops) * 100).toFixed(2) : '0.00';
                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-medium text-gray-900">{item.vendor}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.hops}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.sales > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {item.sales}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parseFloat(conversionRate) > 0 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {conversionRate}%
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm font-medium text-gray-900">
                            ${item.earnings.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* JSON brut (collapsible) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 p-2 bg-gray-100 rounded">
                📋 Voir les données JSON brutes
              </summary>
              <pre className="mt-2 bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96 border border-gray-200">
                {JSON.stringify(clicksData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </section>

    </div>
  );
}
