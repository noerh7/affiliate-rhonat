import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProductDetails } from '../api/marketplace';
import { getBrands } from '../api/brands';
import { updateProduct, deleteProduct } from '../api/products';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    commission_percent: '',
    landing_url: '',
    brand_id: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getProductDetails(id)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
          setProduct(null);
        } else {
          setProduct(data);
          setForm({
            name: data?.name ?? '',
            price: data?.price?.toString() ?? '',
            commission_percent: data?.commission_percent?.toString() ?? '',
            landing_url: data?.landing_url ?? '',
            brand_id: data?.brand_id ?? '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getBrands().then(({ data }) => setBrands(data ?? []));
  }, []);

  function handleGoBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/products');
    }
  }

  async function handleUpdate() {
    if (!id) return;
    if (!form.name || !form.price || !form.landing_url || !form.brand_id) {
      alert('Tous les champs sont requis.');
      return;
    }

    const landingUrl = (() => {
      const trimmed = form.landing_url.trim();
      if (!trimmed) return '';
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    })();

    setSaving(true);
    const { error: updateError } = await updateProduct(id, {
      name: form.name,
      price: Number(form.price),
      commission_percent: Number(form.commission_percent || 0),
      landing_url: landingUrl,
      brand_id: form.brand_id,
    });
    setSaving(false);
    if (updateError) {
      setToast({ message: updateError.message, type: 'error' });
      return;
    }
    setProduct((p: any) => ({
      ...p,
      name: form.name,
      price: Number(form.price),
      commission_percent: Number(form.commission_percent || 0),
      landing_url: landingUrl,
      brand_id: form.brand_id,
      brand: brands.find((b) => b.id === form.brand_id) ?? p?.brand,
    }));
    setToast({ message: 'Produit mis à jour.', type: 'success' });
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Supprimer ce produit ? Cette action est définitive.')) return;
    setDeleting(true);
    const { error: deleteError } = await deleteProduct(id);
    setDeleting(false);
    if (deleteError) {
      setToast({ message: deleteError.message, type: 'error' });
      return;
    }
    navigate('/products');
  }

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="p-6 w-full">
          {toast && (
            <div className="fixed top-4 right-4 z-50">
              <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            </div>
          )}
          Chargement…
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="p-6 w-full text-red-600">
          {toast && (
            <div className="fixed top-4 right-4 z-50">
              <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            </div>
          )}
          Erreur : {error}
        </main>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full space-y-6">
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}
        <div className="flex items-start justify-between">
          <div>
            <button
              type="button"
              onClick={handleGoBack}
              className="mb-2 inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 mr-2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Revenir en arrière
            </button>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-700">
              Marque :{' '}
              <span className="font-semibold">
                {product.brand?.name ?? 'Marque inconnue'}
              </span>
              {product.brand?.domain && (
                <a
                  href={`https://${product.brand.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline underline-offset-2 ml-2"
                >
                  {product.brand.domain}
                </a>
              )}
            </p>
            <p className="text-gray-600 text-sm">
              Créé le {new Date(product.created_at).toLocaleDateString()}
            </p>
          </div>
          <a
            href={product.landing_url}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Ouvrir la page produit
          </a>
        </div>

        <div className="bg-white rounded shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold">Modifier le produit</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Nom du produit"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="border p-2 rounded"
              value={form.brand_id}
              onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
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
            />
            <input
              className="border p-2 rounded"
              placeholder="Commission (%)"
              type="number"
              value={form.commission_percent}
              onChange={(e) => setForm({ ...form, commission_percent: e.target.value })}
            />
            <input
              className="border p-2 rounded col-span-2"
              placeholder="URL de destination"
              value={form.landing_url}
              onChange={(e) => setForm({ ...form, landing_url: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Suppression…' : 'Supprimer le produit'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Prix</p>
            <p className="text-xl font-semibold">{product.price}€</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Commission</p>
            <p className="text-xl font-semibold">{product.commission_percent}%</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Gravité</p>
            <p className="text-xl font-semibold">{product.gravity_score}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Stats 30j</p>
            <p className="text-sm text-gray-700">
              {product.sales_30d} ventes / {product.clicks_30d} clics
            </p>
          </div>
        </div>

        <div className="bg-white rounded shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Liens d’affiliation existants</h2>
            <span className="text-sm text-gray-500">{product.affiliate_links.length} lien(s)</span>
          </div>
          {product.affiliate_links.length === 0 ? (
            <div className="p-4 text-gray-600">Aucun lien d’affiliation créé pour ce produit.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Affilié</th>
                  <th className="px-4 py-2">Créé le</th>
                </tr>
              </thead>
              <tbody>
                {product.affiliate_links.map((l: any) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm">{l.code}</td>
                    <td className="px-4 py-2">{l.affiliate_name}</td>
                    <td className="px-4 py-2">
                      {l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
