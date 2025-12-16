import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

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
    <div className="app-background flex gap-6">
      <Sidebar />
      <div className="w-full space-y-4">
        <Navbar />
        <main className="page-surface p-6 w-full flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 font-medium">Connecteur partenaires</p>
              <h1 className="text-2xl font-bold">ClickBank</h1>
            </div>
            <span className="badge-soft">Nouveau</span>
          </div>

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}


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
                {loadingClicks ? 'Chargement...' : 'Récupérer les clics'}
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
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Résultats ({clicksData.data.length} Tracking ID(s)):</h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96">
                  {JSON.stringify(clicksData, null, 2)}
                </pre>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
