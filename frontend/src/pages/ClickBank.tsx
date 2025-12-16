import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import {
  getClicksAnalytics,
  createAffiliateLink,
  type AnalyticsResponse,
  type CreateAffiliateLinkResponse,
} from '../api/clickbank';

function getDefaultDateRange(days = 7) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { start: format(start), end: format(end) };
}

export default function Clickbank() {
  const defaultRange = getDefaultDateRange();
  // API Key gérée en interne
  const developerKey = 'API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT';

  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  // États pour les statistiques de clics
  const [loadingClicks, setLoadingClicks] = useState(false);
  const [clicksData, setClicksData] = useState<AnalyticsResponse | null>(null);

  // États pour la création de lien
  const [creatingLink, setCreatingLink] = useState(false);
  const [linkData, setLinkData] = useState<CreateAffiliateLinkResponse | null>(null);

  // États pour les formulaires
  const [analyticsFilters, setAnalyticsFilters] = useState({
    startDate: defaultRange.start,
    endDate: defaultRange.end,
    trackingId: '',
    select: 'HOP_COUNT,SALE_COUNT',
    dimension: 'vendor',
    account: 'freenzy',
  });
  const [linkForm, setLinkForm] = useState({
    affiliateNickname: '',
    vendorNickname: '',
    trackingId: '',
  });



  async function handleGetClicks() {
    if (!developerKey) {
      setToast({ message: 'Veuillez entrer votre Developer API Key', type: 'error' });
      return;
    }
    if (!analyticsFilters.startDate || !analyticsFilters.endDate) {
      setToast({ message: 'Veuillez définir une date de début et de fin.', type: 'error' });
      return;
    }
    const dimension = analyticsFilters.dimension || 'TRACKING_ID';
    const account = analyticsFilters.account?.trim();
    if (dimension.toLowerCase() === 'vendor' && !account) {
      setToast({ message: 'Veuillez renseigner un account (vendor) pour la dimension vendor.', type: 'error' });
      return;
    }
    const metrics = analyticsFilters.select?.trim() || 'HOP_COUNT,SALE_COUNT';

    setLoadingClicks(true);
    setClicksData(null);

    try {
      const filters: any = {};
      if (analyticsFilters.startDate) filters.startDate = analyticsFilters.startDate;
      if (analyticsFilters.endDate) filters.endDate = analyticsFilters.endDate;
      if (analyticsFilters.trackingId) filters.trackingId = analyticsFilters.trackingId;
      if (metrics) filters.select = metrics;
      if (dimension) filters.dimension = dimension.toUpperCase();
      if (account) filters.account = account;

      const response = await getClicksAnalytics({
        apiKey: developerKey,
        developerKey: developerKey,
      }, {
        role: 'AFFILIATE',
        ...filters,
      });

      setClicksData(response);
      setToast({
        message: `Statistiques récupérées pour ${response.data.length} Tracking ID(s)`,
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        message: `Erreur: ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoadingClicks(false);
    }
  }

  async function handleCreateLink() {
    if (!developerKey) {
      setToast({ message: 'Veuillez entrer votre Developer API Key', type: 'error' });
      return;
    }

    if (!linkForm.affiliateNickname || !linkForm.vendorNickname || !linkForm.trackingId) {
      setToast({ message: 'Veuillez remplir tous les champs du formulaire', type: 'error' });
      return;
    }

    setCreatingLink(true);
    setLinkData(null);

    try {
      const response = await createAffiliateLink({
        apiKey: developerKey,
        developerKey: developerKey,
      }, linkForm);

      setLinkData(response);
      setToast({
        message: 'Lien d\'affiliation créé avec succès !',
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        message: `Erreur: ${error.message}`,
        type: 'error',
      });
    } finally {
      setCreatingLink(false);
    }
  }

  return (
    <div className="app-background flex gap-6">
      <Sidebar />
      <div className="w-full space-y-4">
        <Navbar />
        <main className="page-surface p-6 w-full flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 font-medium">Connecteur partenaires</p>
              <h1 className="text-2xl font-bold">ClickBank</h1>
            </div>
            <span className="badge-soft">Nouveau</span>
          </div>

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}


          {/* Section Statistiques de clics */}
          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Statistiques de clics</h2>
                <p className="text-sm text-gray-600">Récupérez les détails des clics par Tracking ID</p>
              </div>
              <button
                onClick={handleGetClicks}
                disabled={loadingClicks || !developerKey}
                className="btn-primary text-sm"
              >
                {loadingClicks ? 'Chargement...' : 'Récupérer les clics'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Date de début (yyyy-mm-dd)</span>
                <input
                  type="date"
                  className="input"
                  value={analyticsFilters.startDate}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, startDate: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Date de fin (yyyy-mm-dd)</span>
                <input
                  type="date"
                  className="input"
                  value={analyticsFilters.endDate}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, endDate: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-700">Tracking ID (optionnel)</span>
                <input
                  className="input"
                  placeholder="Filtrer par Tracking ID spécifique"
                  value={analyticsFilters.trackingId}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, trackingId: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Dimension</span>
                <select
                  className="input"
                  value={analyticsFilters.dimension}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, dimension: e.target.value })}
                >
                  <option value="vendor">vendor</option>
                  <option value="TRACKING_ID">TRACKING_ID</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">
                  Account (vendor) — requis pour la dimension vendor
                </span>
                <input
                  className="input"
                  placeholder="ex: freenzy"
                  value={analyticsFilters.account}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, account: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-700">Metrics (select)</span>
                <input
                  className="input"
                  placeholder="HOP_COUNT,SALE_COUNT"
                  value={analyticsFilters.select}
                  onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, select: e.target.value })}
                />
              </label>
            </div>
            {clicksData && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Résultats ({clicksData.data.length} Tracking ID(s)):</h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96">
                  {JSON.stringify(clicksData, null, 2)}
                </pre>
              </div>
            )}
          </section>

          {/* Section Création de lien d'affiliation */}
          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Créer un lien d'affiliation</h2>
                <p className="text-sm text-gray-600">
                  Générez un HopLink en associant l'influenceur (UUID) et le produit ClickBank (nickname vendeur).
                </p>
              </div>
              <button
                onClick={handleCreateLink}
                disabled={creatingLink || !developerKey}
                className="btn-primary text-sm"
              >
                {creatingLink ? 'Création...' : 'Créer le lien'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Influenceur UUID *</span>
                <input
                  className="input"
                  placeholder="UUID de l'influenceur (sera dans le HopLink)"
                  value={linkForm.affiliateNickname}
                  onChange={(e) => setLinkForm({ ...linkForm, affiliateNickname: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Nickname Vendeur *</span>
                <input
                  className="input"
                  placeholder="produitx"
                  value={linkForm.vendorNickname}
                  onChange={(e) => setLinkForm({ ...linkForm, vendorNickname: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Tracking ID *</span>
                <input
                  className="input"
                  placeholder="campagne_fb_1"
                  value={linkForm.trackingId}
                  onChange={(e) => setLinkForm({ ...linkForm, trackingId: e.target.value })}
                />
              </label>
            </div>
            {linkData && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold">Lien créé avec succès:</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">URL du HopLink:</p>
                  <code className="text-xs bg-white p-2 rounded block break-all">{linkData.link.url}</code>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96">
                  {JSON.stringify(linkData, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
