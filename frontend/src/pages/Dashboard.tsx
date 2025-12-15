import Sidebar from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import Navbar from '../components/Navbar';
import { useStats } from '../hooks/useStats';

export default function Dashboard() {
  const { stats, loading, error } = useStats();

  return (
    <div className="app-background flex gap-6">
      <Sidebar />
      <div className="w-full space-y-4">
        <Navbar />
        <main className="page-surface p-6 w-full flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 font-medium">Vue générale</p>
              <h1 className="text-2xl font-bold">Dashboard affilié</h1>
            </div>
            <button type="button" className="btn-primary text-sm">
              Rafraîchir
            </button>
          </div>

          {loading && <div className="text-gray-600">Chargement des statistiques…</div>}
          {error && <div className="text-red-600 text-sm">Erreur : {error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Clics" value={stats?.clicks ?? 0} />
            <StatCard label="Ventes" value={stats?.sales ?? 0} />
            <StatCard label="Revenus" value={`${stats?.revenue ?? 0}€`} />
          </div>

          <div className="card p-4 text-xs mt-2">
            <div className="font-semibold mb-2 text-sm text-gray-700">Données brutes</div>
            <pre className="text-gray-700 whitespace-pre-wrap">{JSON.stringify(stats ?? {}, null, 2)}</pre>
          </div>
        </main>
      </div>
    </div>
  );
}
