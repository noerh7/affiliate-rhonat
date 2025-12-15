import { FormEvent, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import ClickbankRequestPreview from '../components/clickbank/ClickbankRequestPreview';
import VendorAnalyticsPlayground from '../components/clickbank/VendorAnalyticsPlayground';
import BackendAnalyticsSummary from '../components/clickbank/BackendAnalyticsSummary';
import OrdersSummary from '../components/clickbank/OrdersSummary';
import {
  getOrders,
  getAllOrders,
  getClicksAnalytics,
  createAffiliateLink,
  testConnection,
  type OrdersResponse,
  type AnalyticsResponse,
  type CreateAffiliateLinkResponse,
  type ClickBankConnectionResult,
} from '../api/clickbank';

type ClickbankCredentials = {
  nickname: string; // ici: UUID de l'influenceur que vous voulez tracer
  developerKey: string;
};

function getDefaultDateRange(days = 7) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { start: format(start), end: format(end) };
}

export default function Clickbank() {
  const defaultRange = getDefaultDateRange();
  const [credentials, setCredentials] = useState<ClickbankCredentials>({
    nickname: '',
    developerKey: 'API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);
  
  // États pour les tests API
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersData, setOrdersData] = useState<OrdersResponse | null>(null);
  const [loadingClicks, setLoadingClicks] = useState(false);
  const [clicksData, setClicksData] = useState<AnalyticsResponse | null>(null);
  const [loadingVendorAnalytics, setLoadingVendorAnalytics] = useState(false);
  const [vendorAnalyticsData, setVendorAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);
  const [linkData, setLinkData] = useState<CreateAffiliateLinkResponse | null>(null);
  const [connectionPayload, setConnectionPayload] = useState<OrdersResponse | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // États pour les formulaires de test
  const [orderFilters, setOrderFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    role: '',
    affiliate: '',
    vendor: '',
    tid: '',
  });
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

  function handleChange(field: keyof ClickbankCredentials, value: string) {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    // Si on modifie le nickname (UUID), on le pousse aussi dans le formulaire de lien
    if (field === 'nickname') {
      setLinkForm((prev) => ({ ...prev, affiliateNickname: value }));
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!credentials.developerKey) {
      setToast({ message: 'La Developer API Key est requise pour les appels.', type: 'error' });
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToast({
        message: "Clé sauvegardée localement. Le Nickname peut être votre UUID utilisateur pour vos HopLinks.",
        type: 'success',
      });
    }, 350);
  }

  // Fonctions de test API
  async function handleTestConnection() {
    if (!credentials.developerKey) {
      setToast({ message: 'Veuillez entrer votre Developer API Key', type: 'error' });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionPayload(null);
    setConnectionError(null);
    
    try {
      const result: ClickBankConnectionResult = await testConnection({
        apiKey: credentials.developerKey,
        developerKey: credentials.developerKey,
      });
      
      setConnectionStatus(result.ok ? 'success' : 'error');
      if (result.payload) setConnectionPayload(result.payload);
      if (result.error) setConnectionError(result.error);
      setToast({
        message: result.ok ? 'Connexion réussie !' : 'Échec de la connexion',
        type: result.ok ? 'success' : 'error',
      });
    } catch (error: any) {
      setConnectionStatus('error');
      setConnectionError(error?.message || String(error));
      setToast({
        message: `Erreur de connexion: ${error.message}`,
        type: 'error',
      });
    } finally {
      setTestingConnection(false);
    }
  }

  async function handleGetOrders() {
    if (!credentials.developerKey) {
      setToast({ message: 'Veuillez entrer votre Developer API Key', type: 'error' });
      return;
    }

    setLoadingOrders(true);
    setOrdersData(null);
    
    try {
      const filters: any = {};
      if (orderFilters.startDate) filters.startDate = orderFilters.startDate;
      if (orderFilters.endDate) filters.endDate = orderFilters.endDate;
      if (orderFilters.type) filters.type = orderFilters.type;
      if (orderFilters.role) filters.role = orderFilters.role;
      if (orderFilters.affiliate) filters.affiliate = orderFilters.affiliate;
      if (orderFilters.vendor) filters.vendor = orderFilters.vendor;
      if (orderFilters.tid) filters.tid = orderFilters.tid;

      const response = await getOrders({
        apiKey: credentials.developerKey,
        developerKey: credentials.developerKey,
      }, filters);
      
      setOrdersData(response);
      setToast({
        message: `${response.orders.length} commande(s) récupérée(s)`,
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        message: `Erreur: ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoadingOrders(false);
    }
  }

  async function handleGetClicks() {
    if (!credentials.developerKey) {
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
        apiKey: credentials.developerKey,
        developerKey: credentials.developerKey,
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

  async function handleGetVendorAnalytics() {
    if (!credentials.developerKey) {
      setToast({ message: 'Veuillez entrer votre Developer API Key', type: 'error' });
      return;
    }

    setLoadingVendorAnalytics(true);
    setVendorAnalyticsData(null);

    try {
      const response = await getClicksAnalytics(
        {
          apiKey: credentials.developerKey,
          developerKey: credentials.developerKey,
        },
        {
          role: 'AFFILIATE',
          dimension: 'vendor',
          account: 'freenzy',
          startDate: '2025-12-01',
          endDate: '2025-12-11',
          select: 'HOP_COUNT,SALE_COUNT',
        }
      );

      setVendorAnalyticsData(response);
      setToast({
        message: `Statistiques vendors récupérées (${response.data.length} ligne(s))`,
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        message: `Erreur: ${error.message}`,
        type: 'error',
      });
    } finally {
      setLoadingVendorAnalytics(false);
    }
  }

  async function handleCreateLink() {
    if (!credentials.developerKey) {
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
        apiKey: credentials.developerKey,
        developerKey: credentials.developerKey,
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

          <section className="card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Identifiants API</h2>
                <p className="text-sm text-gray-600">
                  Pour tester : seule la Developer API Key est nécessaire. Le Nickname sert à construire vos HopLinks
                  (utilisez votre UUID utilisateur si vous le souhaitez).
                </p>
              </div>
              <a
                className="btn-ghost text-sm"
                href="https://accounts.clickbank.com/developer-api-keys"
                target="_blank"
                rel="noreferrer"
              >
                Créer mes clés
              </a>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSave}>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Influenceur (UUID)</span>
                <input
                  className="input"
                  placeholder="UUID de l'influenceur (utilisé comme Nickname/HopLink)"
                  value={credentials.nickname}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Developer API Key</span>
                <input
                  className="input"
                  placeholder="Ex: ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                  value={credentials.developerKey}
                  onChange={(e) => handleChange('developerKey', e.target.value)}
                />
              </label>
              <div className="flex items-end">
                <button type="submit" className="btn-primary text-sm" disabled={saving}>
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </section>

          {/* Résumé backend (Vercel) : ventes, CA, commissions entre 2 dates */}
          <BackendAnalyticsSummary />

          {/* Section Test de connexion */}
          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Test de connexion API</h2>
                <p className="text-sm text-gray-600">Testez votre connexion à l'API ClickBank</p>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={testingConnection || !credentials.developerKey}
                className="btn-primary text-sm"
              >
                {testingConnection ? 'Test en cours...' : 'Tester la connexion'}
              </button>
            </div>
            {connectionStatus !== 'idle' && (
              <div className={`p-3 rounded-lg ${connectionStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {connectionStatus === 'success' ? '✅ Connexion réussie' : '❌ Échec de la connexion'}
              </div>
            )}
            {connectionPayload && (
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-80">
                <div className="font-semibold mb-2">Réponse JSON (orders page 1)</div>
                {JSON.stringify(connectionPayload, null, 2)}
              </div>
            )}
            {connectionError && (
              <div className="bg-red-50 p-4 rounded-lg text-xs text-red-800">
                <div className="font-semibold mb-2">Erreur</div>
                {connectionError}
              </div>
            )}
          </section>

          <ClickbankRequestPreview />

          <VendorAnalyticsPlayground apiKey={credentials.developerKey} />

          {/* Section Analytics vendor (démonstration depuis clickbankdevelopperkey.md) */}
          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Analytics par vendeur (live)</h2>
                <p className="text-sm text-gray-600">
                  Exécute la requête <code>analytics/affiliate/vendor</code> avec l&apos;account <code>freenzy</code> et
                  les dates du fichier clickbankdevelopperkey.md.
                </p>
              </div>
              <button
                onClick={handleGetVendorAnalytics}
                disabled={loadingVendorAnalytics || !credentials.developerKey}
                className="btn-primary text-sm"
              >
                {loadingVendorAnalytics ? 'Chargement...' : 'Exécuter'}
              </button>
            </div>
            <div className="text-sm text-gray-700">
              <p>
                Paramètres: startDate=2025-12-01, endDate=2025-12-11, account=freenzy, select=HOP_COUNT,SALE_COUNT,
                role=AFFILIATE, dimension=vendor.
              </p>
            </div>
            {vendorAnalyticsData && (
              <div className="mt-3 space-y-2">
                <h3 className="text-sm font-semibold">Réponse JSON</h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96">
                  {JSON.stringify(vendorAnalyticsData, null, 2)}
                </pre>
              </div>
            )}
          </section>

          {/* Section Récupération des ventes */}
          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Récupérer les ventes</h2>
                <p className="text-sm text-gray-600">Récupérez les ventes avec tous les détails en JSON</p>
              </div>
              <button
                onClick={handleGetOrders}
                disabled={loadingOrders || !credentials.developerKey}
                className="btn-primary text-sm"
              >
                {loadingOrders ? 'Chargement...' : 'Récupérer les ventes'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Date de début (yyyy-mm-dd)</span>
                <input
                  type="date"
                  className="input"
                  value={orderFilters.startDate}
                  onChange={(e) => setOrderFilters({ ...orderFilters, startDate: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Rôle (VENDOR, AFFILIATE)</span>
                <input
                  className="input"
                  placeholder="Ex: AFFILIATE"
                  value={orderFilters.role}
                  onChange={(e) => setOrderFilters({ ...orderFilters, role: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Nickname vendeur (vendor)</span>
                <input
                  className="input"
                  placeholder="Ex: freenzy"
                  value={orderFilters.vendor}
                  onChange={(e) => setOrderFilters({ ...orderFilters, vendor: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Date de fin (yyyy-mm-dd)</span>
                <input
                  type="date"
                  className="input"
                  value={orderFilters.endDate}
                  onChange={(e) => setOrderFilters({ ...orderFilters, endDate: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Type (SALE, RFND, CGBK)</span>
                <input
                  className="input"
                  placeholder="Ex: SALE"
                  value={orderFilters.type}
                  onChange={(e) => setOrderFilters({ ...orderFilters, type: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Tracking ID</span>
                <input
                  className="input"
                  placeholder="ID de suivi"
                  value={orderFilters.tid}
                  onChange={(e) => setOrderFilters({ ...orderFilters, tid: e.target.value })}
                />
              </label>
            </div>
            {ordersData && (
              <div className="mt-4">
                <OrdersSummary ordersResponse={ordersData} />
                <h3 className="text-sm font-semibold mb-2">
                  Résultats bruts ({ordersData.orders.length} commande(s)):
                </h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96">
                  {JSON.stringify(ordersData, null, 2)}
                </pre>
              </div>
            )}
          </section>

          {/* Section Statistiques de clics */}
          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Statistiques de clics</h2>
                <p className="text-sm text-gray-600">Récupérez les détails des clics par Tracking ID</p>
              </div>
              <button
                onClick={handleGetClicks}
                disabled={loadingClicks || !credentials.developerKey}
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
                disabled={creatingLink || !credentials.developerKey}
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

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Checklist de connexion</h3>
                  <p className="text-sm text-gray-600">Vérifiez chaque étape avant de déployer.</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="badge-soft">1</span>
                  Activez les API Keys depuis ClickBank puis collez-les ci-dessus.
                </li>
                <li className="flex items-start gap-2">
                  <span className="badge-soft">2</span>
                  Autorisez l'IP de votre backend dans ClickBank si nécessaire.
                </li>
                <li className="flex items-start gap-2">
                  <span className="badge-soft">3</span>
                  Planifiez une tâche CRON pour récupérer les ventes et rebills.
                </li>
                <li className="flex items-start gap-2">
                  <span className="badge-soft">4</span>
                  Mappez les produits ClickBank vers vos produits internes (SKU/IDs).
                </li>
              </ul>
            </div>

            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Statut d'intégration</h3>
                  <p className="text-sm text-gray-600">Ajustez la synchronisation depuis ClickBank.</p>
                </div>
                <span className="badge-soft">Sandbox</span>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3 border">
                  <dt className="text-gray-500">Dernier appel API</dt>
                  <dd className="font-semibold text-gray-900">
                    {connectionStatus === 'success' ? 'Connecté' : connectionStatus === 'error' ? 'Erreur' : 'en attente'}
                  </dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border">
                  <dt className="text-gray-500">Ventes importées</dt>
                  <dd className="font-semibold text-gray-900">
                    {ordersData ? `${ordersData.orders.length} (test)` : '0 (pilotage local)'}
                  </dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border">
                  <dt className="text-gray-500">Remboursements</dt>
                  <dd className="font-semibold text-gray-900">Non synchronisés</dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border">
                  <dt className="text-gray-500">Webhook</dt>
                  <dd className="font-semibold text-gray-900">À configurer</dd>
                </div>
              </dl>
              <p className="text-xs text-gray-500">
                Cette page conserve vos champs tant que la session reste ouverte. Branchez le stockage sécurisé (Supabase,
                vault...) pour passer en production.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
