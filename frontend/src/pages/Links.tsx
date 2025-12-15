import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  getAffiliateLinks,
  createAffiliateLink,
  deleteAffiliateLink
} from '../api/affiliate';
import { getProducts } from '../api/products';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';

const BASE_GO_URL =
  import.meta.env.VITE_BASE_GO_URL?.replace(/\/$/, '') ??
  'https://affiliate-rhonat.vercel.app/go';

export default function Links() {
  const { user } = useAuth();
  const [links, setLinks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [customCode, setCustomCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<any | null>(null);
  const [myAffiliateId, setMyAffiliateId] = useState<string | null>(null);

  useEffect(() => {
    getAffiliateLinks().then(({ data }) => setLinks(data ?? []));
    getProducts().then(({ data }) => {
      setProducts(data ?? []);
      if (data?.[0]?.id) setSelectedProduct(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setMyAffiliateId(data?.id ?? null));
  }, [user?.id]);

  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  async function handleCreate() {
    if (!selectedProduct) {
      alert('Choisissez un produit');
      return;
    }
    setLoading(true);
    try {
      const { error } = await createAffiliateLink(selectedProduct, customCode);
      if (error) {
        alert(error.message);
        return;
      }
      setCustomCode('');
      getAffiliateLinks().then(({ data }) => setLinks(data ?? []));
    } catch (e: any) {
      alert(e?.message ?? 'Erreur lors de la création du lien');
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!linkToDelete) return;

    setDeletingId(linkToDelete.id);
    const { error } = await deleteAffiliateLink(linkToDelete.id);
    setDeletingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    setLinks((prev) => prev.filter((link) => link.id !== linkToDelete.id));
    setLinkToDelete(null);
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 w-full flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Mes liens affiliés</h1>

        <div className="bg-white shadow rounded p-4 flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Créer un lien traçable</h2>
          <label className="text-sm font-medium">Produit</label>
          <select
            className="border p-2 rounded"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.price}€
              </option>
            ))}
          </select>

          <label className="text-sm font-medium">Code personnalisé (optionnel)</label>
          <input
            className="border p-2 rounded"
            placeholder="Ex: INSTA-ABC123"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
          />

          <button
            className="bg-blue-600 text-white p-2 rounded disabled:opacity-60"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Création…' : 'Créer le lien'}
          </button>

          <p className="text-sm text-gray-600">
            Chaque lien est unique par affilié et traque automatiquement clics et ventes via Supabase (Edge functions déjà fournies).
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {links.length === 0 && (
            <div className="p-4 bg-white rounded shadow text-gray-600">
              Aucun lien pour le moment. Crée ton premier lien ci-dessus pour suivre clics et ventes.
            </div>
          )}
          {links.map((l) => {
            const product = productMap[l.product_id];
            return (
              <div key={l.id} className="p-3 bg-white rounded shadow flex flex-col gap-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <RouterLink
                      to={`/links/${l.id}`}
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      {product?.name ?? 'Produit'}
                    </RouterLink>
                    <a
                      className="text-sm text-blue-600 hover:underline break-all"
                      href={`${BASE_GO_URL}/${l.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lien : {BASE_GO_URL}/{l.code}
                    </a>
                    <div className="text-xs text-gray-500">
                      Code : {l.code} — Produit #{l.product_id}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    {l.affiliate_id === myAffiliateId && (
                      <span
                        title="Mon lien"
                        className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200"
                      >
                        <StarIcon /> Moi
                      </span>
                    )}
                    <button
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      title="Supprimer le lien"
                      onClick={() => setLinkToDelete(l)}
                      disabled={deletingId === l.id}
                      aria-label="Supprimer le lien"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {linkToDelete && (
        <ConfirmDeleteModal
          link={linkToDelete}
          product={productMap[linkToDelete.product_id]}
          onCancel={() => setLinkToDelete(null)}
          onConfirm={confirmDelete}
          loading={deletingId === linkToDelete.id}
        />
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8 2a2 2 0 00-2 2v1H4a1 1 0 100 2h.293l.853 8.533A2 2 0 007.138 18h5.724a2 2 0 001.992-1.467L15.707 7H16a1 1 0 100-2h-2V4a2 2 0 00-2-2H8zm4 3V4a1 1 0 00-1-1H8a1 1 0 00-1 1v1h5zM9 9a1 1 0 112 0v5a1 1 0 11-2 0V9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type ConfirmDeleteModalProps = {
  link: any;
  product?: any;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  loading: boolean;
};

function ConfirmDeleteModal({
  link,
  product,
  onCancel,
  onConfirm,
  loading
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400" />
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <WarningIcon />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Suppression du lien
              </p>
              <p className="text-lg font-semibold text-gray-900">
                Supprimer ce lien affilié ?
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Cette action enlèvera le lien de ta liste mais ne supprimera pas l'historique de clics/ventes associés.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm text-gray-800 font-semibold truncate">
              {product?.name ?? 'Produit'}
            </p>
            <p className="text-xs text-gray-600 mt-1 break-all font-mono">
              {BASE_GO_URL}/{link.code}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition"
              type="button"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition"
              type="button"
            >
              {loading ? 'Suppression...' : 'Supprimer le lien'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10.414 3.16c.74-1.28 2.432-1.28 3.172 0l8.25 14.25c.74 1.278-.185 2.89-1.586 2.89H3.75c-1.4 0-2.326-1.612-1.586-2.89l8.25-14.25Zm1.586 4.09a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75Zm0 9.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 2.5 14.9 9h6.1l-5 3.8 1.9 6.2L12 15.8 6.1 19l1.9-6.2-5-3.8h6.1L12 2.5Z" />
    </svg>
  );
}
