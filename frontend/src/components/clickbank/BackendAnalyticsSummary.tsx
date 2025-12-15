import { useState } from 'react';
import {
  fetchBackendAnalytics,
  fetchBackendOrders,
  type BackendAnalytics,
  type BackendOrdersResponse,
} from '../../api/clickbank-backend';

type DateRange = {
  startDate: string;
  endDate: string;
};

function getDefaultDateRange(days = 7): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const format = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: format(start), endDate: format(end) };
}

export default function BackendAnalyticsSummary() {
  const defaultRange = getDefaultDateRange();
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<BackendAnalytics | null>(null);
  const [ordersSummary, setOrdersSummary] = useState<{
    totalOrders: number;
    totalRevenue: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    if (!range.startDate || !range.endDate) {
      setError('Veuillez sélectionner une date de début et de fin.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalytics(null);
    setOrdersSummary(null);

    try {
      // 1) Résumé agrégé (ventes, CA, commissions)
      const analyticsRes = await fetchBackendAnalytics({
        startDate: range.startDate,
        endDate: range.endDate,
      });
      setAnalytics(analyticsRes.data);

      // 2) Détail des commandes pour calculer le chiffre d'affaires exact
      const ordersRes: BackendOrdersResponse = await fetchBackendOrders({
        startDate: range.startDate,
        endDate: range.endDate,
      });

      const totalRevenue = ordersRes.data.reduce(
        (sum, order) => sum + (order.totalOrderAmount || 0),
        0
      );

      setOrdersSummary({
        totalOrders: ordersRes.count,
        totalRevenue,
      });
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Résumé backend ClickBank (Vercel)</h2>
          <p className="text-sm text-gray-600">
            Utilise votre backend&nbsp;
            <code className="bg-slate-100 px-1 rounded text-xs">/api/clickbank/orders</code>{' '}
            et{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">/api/clickbank/analytics</code>{' '}
            pour mesurer les ventes et le chiffre d&apos;affaires entre deux dates.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="btn-primary text-sm"
        >
          {loading ? 'Analyse en cours...' : 'Analyser la période'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Date de début</span>
          <input
            type="date"
            className="input"
            value={range.startDate}
            onChange={(e) => setRange((prev) => ({ ...prev, startDate: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Date de fin</span>
          <input
            type="date"
            className="input"
            value={range.endDate}
            onChange={(e) => setRange((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {(analytics || ordersSummary) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-50 border rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Nombre de ventes
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {ordersSummary?.totalOrders ?? analytics?.totalOrders ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Commandes ClickBank sur la période sélectionnée.
            </p>
          </div>
          <div className="bg-slate-50 border rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Chiffre d&apos;affaires (totalOrderAmount)
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {ordersSummary
                ? ordersSummary.totalRevenue.toFixed(2)
                : analytics
                ? analytics.totalSales.toFixed(2)
                : '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Somme des montants de commande retournés par le backend.
            </p>
          </div>
          <div className="bg-slate-50 border rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Commissions (si disponibles)
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {analytics ? analytics.totalCommissions.toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Valeur retournée par <code>analytics</code> (somme des commissions).
            </p>
          </div>
        </div>
      )}
    </section>
  );
}


