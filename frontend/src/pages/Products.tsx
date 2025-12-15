import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, createProduct } from '../api/products';
import { createAffiliateLink } from '../api/affiliate';
import { createBrand, getBrands } from '../api/brands';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';

type Product = {
  id: string;
  name: string;
  price: number;
  commission_percent: number;
  landing_url: string;
  brand_id: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingProduct, setCreatingProduct] = useState<boolean>(false);
  const [creatingLinkId, setCreatingLinkId] = useState<string | null>(null);
  const [creatingBrand, setCreatingBrand] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    commission_percent: '30',
    landing_url: '',
    brand_id: ''
  });

  const [brandForm, setBrandForm] = useState({
    name: '',
    domain: ''
  });

  useEffect(() => {
    refreshProducts();
    refreshBrands();
  }, []);

  function refreshProducts() {
    setLoading(true);
    getProducts().then(({ data }) => {
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    });
  }

  function refreshBrands() {
    getBrands().then(({ data }) => {
      setBrands(data ?? []);
      if (!form.brand_id && data?.[0]?.id) {
        setForm((f) => ({ ...f, brand_id: data[0].id }));
      }
    });
  }

  async function handleCreateBrand() {
    if (!brandForm.name || !brandForm.domain) {
      setToast({ message: 'Nom et domaine sont requis pour créer une marque.', type: 'error' });
      return;
    }
    setCreatingBrand(true);
    const { error } = await createBrand({ name: brandForm.name, domain: brandForm.domain });
    setCreatingBrand(false);
    if (error) {
      setToast({ message: error.message, type: 'error' });
      return;
    }
    setBrandForm({ name: '', domain: '' });
    setToast({ message: 'Marque créée.', type: 'success' });
    refreshBrands();
  }

  async function handleCreateProduct() {
    if (!form.name || !form.price || !form.landing_url || !form.brand_id) {
      setToast({ message: 'Tous les champs sont requis.', type: 'error' });
      return;
    }

    const landingUrl = (() => {
      const trimmed = form.landing_url.trim();
      if (!trimmed) return '';
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    })();

    setCreatingProduct(true);
    const { error } = await createProduct({
      name: form.name,
      price: Number(form.price),
      commission_percent: Number(form.commission_percent || 0),
      landing_url: landingUrl,
      brand_id: form.brand_id
    });
    setCreatingProduct(false);
    if (error) {
      setToast({ message: error.message, type: 'error' });
      return;
    }
    setForm((f) => ({ ...f, name: '', price: '', landing_url: '' }));
    setToast({ message: 'Produit créé.', type: 'success' });
    refreshProducts();
  }

  async function handleCreateLink(productId: string) {
    setCreatingLinkId(productId);
    const { error } = await createAffiliateLink(productId);
    setCreatingLinkId(null);
    if (error) setToast({ message: error.message, type: 'error' });
    else setToast({ message: 'Lien créé ! Retrouve-le dans l’onglet Mes liens.', type: 'success' });
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full space-y-6">
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}
        <h1 className="text-2xl font-bold">Produits</h1>

        <div className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="text-lg font-semibold">Créer une marque</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Nom de la marque"
              value={brandForm.name}
              onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Domaine (ex: brand.com)"
              value={brandForm.domain}
              onChange={(e) => setBrandForm({ ...brandForm, domain: e.target.value })}
            />
          </div>
          <button
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            onClick={handleCreateBrand}
            disabled={creatingBrand}
          >
            {creatingBrand ? 'Création…' : 'Créer la marque'}
          </button>
          <p className="text-sm text-gray-600">
            Crée au moins une marque pour alimenter la liste déroulante des produits.
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="text-lg font-semibold">Créer un nouveau produit</h2>
          {brands.length === 0 && (
            <div className="p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
              Aucune marque disponible. Crée une marque ci-dessus pour activer le formulaire produit.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Nom du produit"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={brands.length === 0}
            />
            <select
              className="border p-2 rounded"
              value={form.brand_id}
              onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
              disabled={brands.length === 0}
            >
              <option value="">Sélectionner une marque</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              className="border p-2 rounded"
              placeholder="Prix (€)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              disabled={brands.length === 0}
            />
            <input
              className="border p-2 rounded"
              placeholder="Commission (%)"
              type="number"
              value={form.commission_percent}
              onChange={(e) => setForm({ ...form, commission_percent: e.target.value })}
              disabled={brands.length === 0}
            />
            <input
              className="border p-2 rounded col-span-2"
              placeholder="URL de destination"
              value={form.landing_url}
              onChange={(e) => setForm({ ...form, landing_url: e.target.value })}
              disabled={brands.length === 0}
            />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleCreateProduct}
            disabled={creatingProduct || brands.length === 0}
          >
            {creatingProduct ? 'Création...' : 'Créer le produit'}
          </button>
        </div>

        {loading && <div className="text-gray-600 mb-2">Chargement des produits…</div>}
        {!loading && products.length === 0 && (
          <div className="bg-white p-4 rounded shadow text-gray-600">Aucun produit disponible pour le moment.</div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white shadow p-4 rounded flex flex-col gap-2">
              <div>
                <h2 className="font-semibold text-lg mb-1">{p.name}</h2>
                <p className="text-gray-700 mb-1">{p.price}€</p>
                <p className="text-sm text-gray-500">Commission: {p.commission_percent}%</p>
              </div>
              <Link
                to={`/products/${p.id}`}
                className="text-blue-600 text-sm underline underline-offset-2"
              >
                Voir le détail
              </Link>
              <button
                className="bg-green-600 text-white px-3 py-2 rounded text-sm disabled:opacity-60"
                onClick={() => handleCreateLink(p.id)}
                disabled={creatingLinkId === p.id}
              >
                {creatingLinkId === p.id ? 'Création du lien…' : 'Créer un lien d’affiliation'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
