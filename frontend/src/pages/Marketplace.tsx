import { useEffect, useState } from 'react';
import { getMarketplaceProducts } from '../api/marketplace';
import ProductCard from '../components/marketplace/ProductCard';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getMarketplaceProducts().then(({ data }) => {
      setProducts(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="app-background flex gap-6">
      <Sidebar />
      <div className="w-full space-y-4">
        <Navbar />
        <main className="page-surface p-6 w-full">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Sélection des marques</p>
              <h1 className="text-2xl font-bold">Marketplace des Produits</h1>
            </div>
            <button type="button" className="btn-ghost text-sm">Filtrer</button>
          </div>

          {loading && <div className="text-gray-600 mb-2">Chargement des offres…</div>}
          {!loading && products.length === 0 && (
            <div className="card p-4 text-gray-600">
              Aucune offre disponible pour le moment. Revenez plus tard ou contactez une marque.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => <ProductCard key={p.product_id} product={p} />)}
          </div>
        </main>
      </div>
    </div>
  );
}

