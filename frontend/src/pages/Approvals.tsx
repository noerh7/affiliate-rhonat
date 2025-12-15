import { useEffect, useState } from 'react';
import { getApprovals } from '../api/approvals';
import Sidebar from '../components/Sidebar';

export default function Approvals() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getApprovals().then(({ data }) => {
      setApprovals(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full">
        <h1 className="text-xl font-bold mb-4">Mes demandes d'approbation</h1>
        {loading && <div className="text-gray-600">Chargement des demandes…</div>}
        {!loading && approvals.length === 0 && (
          <div className="bg-white p-4 rounded shadow text-gray-600">
            Aucune demande pour l'instant. Demande l'accès à un produit depuis la Marketplace.
          </div>
        )}
        {approvals.map((a) => (
          <div key={a.id} className="bg-white shadow p-3 rounded mb-2">
            Produit: {a.product_id} — Statut : {a.status}
          </div>
        ))}
      </main>
    </div>
  );
}
