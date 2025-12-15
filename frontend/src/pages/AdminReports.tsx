import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getAdminAggregates, AdminAggregates } from '../api/admin';

export default function AdminReports() {
  const [data, setData] = useState<AdminAggregates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAdminAggregates()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setData(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="p-8 w-full flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rapports</p>
          <h1 className="text-3xl font-bold text-slate-900">Admin — Clics / Ventes / Revenus</h1>
          <p className="text-sm text-slate-600 max-w-3xl">
            Vue agrégée par marque, produit et affilié pour suivre l’impact de vos campagnes en un clin d’œil.
          </p>
        </header>

        {loading && <div className="rounded-xl bg-white shadow p-4 text-sm text-slate-600">Chargement...</div>}
        {error && <div className="rounded-xl bg-red-50 text-red-700 border border-red-100 p-4">Erreur : {error}</div>}
        {data && (
          <div className="flex flex-col gap-6">
            <Section
              title="Par marque"
              accent="from-sky-500 to-sky-600"
              rows={data.by_brand}
              entityLabel="marque"
              columns={[
                { key: 'brand_name', label: 'Marque' },
                { key: 'clicks', label: 'Clics' },
                { key: 'sales', label: 'Ventes' },
                { key: 'revenue', label: 'Revenus (€)' },
              ]}
            />

            <Section
              title="Par produit"
              accent="from-indigo-500 to-indigo-600"
              rows={data.by_product}
              entityLabel="produit"
              columns={[
                { key: 'product_name', label: 'Produit' },
                { key: 'clicks', label: 'Clics' },
                { key: 'sales', label: 'Ventes' },
                { key: 'revenue', label: 'Revenus (€)' },
              ]}
            />

            <Section
              title="Par affilié"
              accent="from-amber-500 to-amber-600"
              rows={data.by_affiliate}
              entityLabel="affilié"
              columns={[
                { key: 'display_name', label: 'Affilié' },
                { key: 'clicks', label: 'Clics' },
                { key: 'sales', label: 'Ventes' },
                { key: 'revenue', label: 'Revenus (€)' },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

type Column = { key: string; label: string };

function Section({
  title,
  rows,
  columns,
  accent,
  entityLabel,
}: {
  title: string;
  rows: any[];
  columns: Column[];
  accent: string;
  entityLabel: string;
}) {
  const totals = getTotals(rows);
  const topPerformer = getTopPerformer(rows, columns[0]?.key, 'revenue');

  return (
    <div className="rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden flex flex-col">
      <div className={`px-5 py-4 bg-gradient-to-r ${accent} text-white flex items-center justify-between`}>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] opacity-80">Synthèse</p>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge label="Clics" value={totals.clicks} tone="bg-white/15" />
          <Badge label="Ventes" value={totals.sales} tone="bg-white/15" />
          <Badge label="Revenus" value={`€${totals.revenue.toFixed(2)}`} tone="bg-white/15" />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500 px-5 py-6 bg-slate-50">Aucune donnée pour cette section.</p>
      ) : (
        <>
          {topPerformer && (
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs uppercase text-slate-500 tracking-wide">Meilleure {entityLabel}</span>
                <span className="text-base font-semibold text-slate-900">{topPerformer.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                  €{topPerformer.revenue.toFixed(2)}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700">
                  {topPerformer.sales} ventes
                </span>
              </div>
            </div>
          )}
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="text-left px-4 py-3">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-slate-800">
                        {formatValue(r[c.key], c.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function getTotals(rows: any[]) {
  return rows.reduce(
    (acc, row) => ({
      clicks: acc.clicks + (Number(row.clicks) || 0),
      sales: acc.sales + (Number(row.sales) || 0),
      revenue: acc.revenue + (Number(row.revenue) || 0),
    }),
    { clicks: 0, sales: 0, revenue: 0 }
  );
}

function getTopPerformer(rows: any[], nameKey?: string, revenueKey?: string) {
  if (!nameKey || !revenueKey || rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => (Number(b[revenueKey]) || 0) - (Number(a[revenueKey]) || 0));
  const top = sorted[0];
  return {
    name: top?.[nameKey] ?? 'N/A',
    revenue: Number(top?.[revenueKey] || 0),
    sales: Number(top?.sales || 0),
  };
}

function Badge({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-2 ${tone}`}>
      <span className="uppercase tracking-wide opacity-90">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function formatValue(val: any, key?: string) {
  if (key === 'revenue') {
    const num = Number(val) || 0;
    return `€${num.toFixed(2)}`;
  }
  if (typeof val === 'number' && !Number.isInteger(val)) {
    return val.toFixed(2);
  }
  if (val === 0) return 0;
  return val ?? '-';
}
