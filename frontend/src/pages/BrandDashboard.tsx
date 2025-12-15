import Sidebar from '../components/Sidebar';
import { StatCard } from '../components/StatCard';

export default function BrandDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard Marque</h1>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Affiliés actifs" value="0" />
          <StatCard label="Ventes totales" value="0" />
          <StatCard label="Commissions payées" value="0€" />
        </div>
      </main>
    </div>
  );
}
