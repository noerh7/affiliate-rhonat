import Sidebar from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { useStats } from '../hooks/useStats';
import ClicksSalesChart from '../components/analytics/ClicksSalesChart';
import ConversionFunnel from '../components/analytics/ConversionFunnel';
import EpcCard from '../components/analytics/EpcCard';
import HeatmapClicks from '../components/analytics/HeatmapClicks';
import ClicksDetails from '../components/analytics/ClicksDetails';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function AffiliateDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { stats, loading, error } = useStats();

  const chartData = stats?.history ?? [];
  const heatmapData = stats?.hourly ?? [];

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('nav.affiliate')}</h1>
          {loading && <span className="text-sm text-gray-500">{t('common.loading')}</span>}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 max-w-2xl">
              <strong>{t('common.error')} :</strong> {error}
              {error.includes('migration SQL') && (
                <div className="mt-2 text-xs text-red-700">
                  <p className="font-semibold">Solution :</p>
                  <p>Exécutez les migrations SQL dans votre base de données Supabase :</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>06_rename_affiliate_stats.sql</li>
                    <li>09_clicks_details.sql</li>
                  </ul>
                </div>
              )}
              {error.includes('bloquée par une extension') && (
                <div className="mt-2 text-xs text-red-700">
                  <p className="font-semibold">Solution :</p>
                  <p>Désactivez temporairement les bloqueurs de publicité ou extensions de sécurité dans votre navigateur.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label={t('dashboard.totalClicks')} value={stats?.clicks ?? 0} />
          <StatCard label={t('links.sales')} value={stats?.sales ?? 0} />
          <StatCard label={t('dashboard.revenue')} value={`${stats?.revenue ?? 0}€`} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <EpcCard clicks={stats?.clicks ?? 0} revenue={stats?.revenue ?? 0} />
          <ConversionFunnel clicks={stats?.clicks ?? 0} sales={stats?.sales ?? 0} />
          <div className="p-4 bg-white rounded shadow text-sm text-gray-600">
            <div className="font-semibold mb-2">Conseil</div>
            Utilise ces KPIs pour adapter tes canaux (influenceur, campagne, email).
          </div>
        </div>

        {!loading && !error && (!stats || (stats.clicks === 0 && stats.sales === 0)) && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
            <strong>💡 Aucune donnée pour le moment</strong>
            <p className="mt-1">Commencez à partager vos liens d'affiliation pour voir vos statistiques ici.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <ClicksSalesChart data={chartData} />
          <HeatmapClicks data={heatmapData} />
        </div>

        <ClicksDetails />
      </main>
    </div>
  );
}
