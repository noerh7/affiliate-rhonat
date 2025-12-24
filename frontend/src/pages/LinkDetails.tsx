import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getAffiliateLinkDetail } from '../api/links';
import { useTranslation } from 'react-i18next';

const BASE_GO_URL =
  import.meta.env.VITE_BASE_GO_URL?.replace(/\/$/, '') ?? 'https://affiliate-rhonat-3c2b.vercel.app/go';

export default function LinkDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getAffiliateLinkDetail(id)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
          setLink(null);
        } else {
          setLink(data);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="p-6 w-full">{t('common.loading')}</main>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="p-6 w-full space-y-3">
          <div className="text-red-600">{t('common.error')} : {error ?? t('links.noLinks')}</div>
          <button
            className="text-blue-600 underline underline-offset-2"
            onClick={() => navigate('/links')}
          >
            {t('common.back')}
          </button>
        </main>
      </div>
    );
  }

  const product = link.product;
  const brand = product?.brand;
  const affiliate = link.affiliate;
  const goUrl = `${BASE_GO_URL}/${link.code}`;

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full space-y-6">
        <button
          className="text-blue-600 underline underline-offset-2 text-sm"
          onClick={() => navigate(-1)}
        >
          ← {t('common.back')}
        </button>

        <div className="bg-white rounded shadow p-4 space-y-2">
          <p className="text-xs text-gray-500">{t('links.linkDetails')}</p>
          <h1 className="text-2xl font-bold break-all">{goUrl}</h1>
          <p className="text-sm text-gray-500">Code : {link.code}</p>
          <p className="text-sm text-gray-500">
            Créé le {link.created_at ? new Date(link.created_at).toLocaleDateString() : '—'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded shadow p-4 space-y-2">
            <p className="text-xs text-gray-500">{t('links.product')}</p>
            <h2 className="text-lg font-semibold">{product?.name ?? 'Produit'}</h2>
            <p className="text-sm text-gray-600">{product?.price}€ — {product?.commission_percent}%</p>
            {product?.landing_url && (
              <a
                href={product.landing_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline underline-offset-2 text-sm break-all"
              >
                Page de destination
              </a>
            )}
          </div>

          <div className="bg-white rounded shadow p-4 space-y-2">
            <p className="text-xs text-gray-500">{t('nav.brand')}</p>
            <h2 className="text-lg font-semibold">{brand?.name ?? 'Marque'}</h2>
            {brand?.domain && (
              <a
                href={`https://${brand.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline underline-offset-2 text-sm break-all"
              >
                {brand.domain}
              </a>
            )}
          </div>

          <div className="bg-white rounded shadow p-4 space-y-2">
            <p className="text-xs text-gray-500">Influenceur</p>
            <h2 className="text-lg font-semibold">{affiliate?.display_name ?? 'Affilié'}</h2>
            <p className="text-sm text-gray-600">ID : {affiliate?.id ?? '—'}</p>
          </div>
        </div>
      </main>
    </div>
  );
}







