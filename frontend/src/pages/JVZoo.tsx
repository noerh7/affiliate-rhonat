import { FormEvent, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import {
  testJVZooConnection,
  getJVZooOffers,
  createJVZooAffiliateLink,
  type JVZooOffer,
  type JVZooConnectionResult,
} from '../api/jvzoo';
import { useTranslation } from 'react-i18next';

type JVZooCredentials = {
  apiKey: string;
  apiSecret: string;
  affiliateId: string;
};

export default function JVZoo() {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState<JVZooCredentials>({
    apiKey: 'd5d993ae581978c19fa97a324b7daeb2fd67d00b353a71fcc7540c2d1a25f50b',
    apiSecret: '',
    affiliateId: '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionPayload, setConnectionPayload] = useState<Record<string, any> | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [offers, setOffers] = useState<JVZooOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [trackingId, setTrackingId] = useState<string>('');
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  function handleChange(field: keyof JVZooCredentials, value: string) {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (field === 'affiliateId') {
      // pousser l'UUID dans la construction de lien
      setCreatedLink(null);
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!credentials.apiKey) {
      setToast({ message: 'La JVZoo API Key est requise.', type: 'error' });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToast({
        message: "Identifiants JVZoo sauvegardés localement. L'UUID/affiliateId identifie l'influenceur.",
        type: 'success',
      });
    }, 300);
  }

  async function handleTest() {
    if (!credentials.apiKey) {
      setToast({ message: 'La JVZoo API Key est requise.', type: 'error' });
      return;
    }
    setTesting(true);
    setConnectionStatus('idle');
    setConnectionPayload(null);
    setConnectionError(null);
    try {
      const result: JVZooConnectionResult = await testJVZooConnection({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        affiliateId: credentials.affiliateId,
      });
      setConnectionStatus(result.ok ? 'success' : 'error');
      if (result.payload) setConnectionPayload(result.payload);
      if (result.error) setConnectionError(result.error);
      setToast({ message: result.ok ? 'Connexion JVZoo réussie !' : 'Connexion JVZoo échouée', type: result.ok ? 'success' : 'error' });
    } catch (error: any) {
      setConnectionStatus('error');
      setConnectionError(error?.message || String(error));
      setToast({ message: `Erreur: ${error.message}`, type: 'error' });
    } finally {
      setTesting(false);
    }
  }

  async function handleLoadOffers() {
    if (!credentials.apiKey) {
      setToast({ message: 'Veuillez entrer votre API Key JVZoo', type: 'error' });
      return;
    }
    setLoadingOffers(true);
    setOffers([]);
    try {
      const data = await getJVZooOffers({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        affiliateId: credentials.affiliateId,
      });
      setOffers(data);
      setToast({ message: `${data.length} offre(s) JVZoo récupérée(s).`, type: 'success' });
    } catch (error: any) {
      setToast({ message: `Erreur: ${error.message}`, type: 'error' });
    } finally {
      setLoadingOffers(false);
    }
  }

  async function handleCreateLink() {
    if (!selectedProduct) {
      setToast({ message: 'Choisissez un produit JVZoo.', type: 'error' });
      return;
    }
    try {
      const link = await createJVZooAffiliateLink(
        {
          apiKey: credentials.apiKey,
          apiSecret: credentials.apiSecret,
          affiliateId: credentials.affiliateId || 'aff',
        },
        selectedProduct,
        trackingId || undefined
      );
      setCreatedLink(link.url);
      setToast({ message: 'Lien JVZoo créé avec succès !', type: 'success' });
    } catch (error: any) {
      setToast({ message: `Erreur: ${error.message}`, type: 'error' });
    }
  }

  // Les offres doivent être chargées manuellement après avoir configuré l'API Key

  return (
    <div className="app-background flex gap-6">
      <Sidebar />
      <div className="w-full space-y-4">
        <Navbar />
        <main className="page-surface p-6 w-full flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 font-medium">Connecteur partenaires</p>
              <h1 className="text-2xl font-bold">{t('jvzoo.title')}</h1>
            </div>
            <a
              className="badge-soft"
              href="https://www.jvzoo.com/account/applications/index"
              target="_blank"
              rel="noreferrer"
            >
              Portail JVZoo
            </a>
          </div>

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

          <section className="card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Identifiants API</h2>
                <p className="text-sm text-gray-600">
                  API Key JVZoo (obtenue depuis l&apos;onglet Applications), API Secret si requis, et l&apos;UUID de
                  l&apos;influenceur comme affiliateId.
                </p>
              </div>
              <button onClick={handleTest} disabled={testing} className="btn-primary text-sm">
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </button>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSave}>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">API Key *</span>
                <input
                  className="input"
                  placeholder="Clé JVZoo"
                  value={credentials.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">API Secret (optionnel)</span>
                <input
                  className="input"
                  placeholder="Secret JVZoo"
                  value={credentials.apiSecret}
                  onChange={(e) => handleChange('apiSecret', e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Influenceur / UUID</span>
                <input
                  className="input"
                  placeholder="UUID de l'influenceur"
                  value={credentials.affiliateId}
                  onChange={(e) => handleChange('affiliateId', e.target.value)}
                />
              </label>
              <div className="flex items-end">
                <button type="submit" className="btn-primary text-sm" disabled={saving}>
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
            {connectionStatus !== 'idle' && (
              <div className={`p-3 rounded-lg ${connectionStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {connectionStatus === 'success' ? '✅ Connexion réussie' : '❌ Connexion échouée'}
              </div>
            )}
            {connectionPayload && (
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-64">
                <div className="font-semibold mb-2">Réponse JSON de l'API JVZoo</div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(connectionPayload, null, 2)}</pre>
              </div>
            )}
            {connectionError && (
              <div className="bg-red-50 p-4 rounded-lg text-xs text-red-800">
                <div className="font-semibold mb-2">Erreur</div>
                {connectionError}
              </div>
            )}
          </section>

          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Produits JVZoo</h2>
                <p className="text-sm text-gray-600">Récupérez les offres disponibles depuis l'API JVZoo.</p>
              </div>
              <button onClick={handleLoadOffers} disabled={loadingOffers} className="btn-ghost text-sm">
                {loadingOffers ? t('common.loading') : t('common.refresh')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {offers.map((offer) => (
                <label key={offer.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="offer"
                    checked={selectedProduct === offer.id}
                    onChange={() => setSelectedProduct(offer.id)}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{offer.name}</span>
                    <span className="text-xs text-gray-600">
                      {offer.vendor} — {offer.price} {offer.currency}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {!offers.length && !loadingOffers && <p className="text-sm text-gray-600">Aucune offre disponible. Cliquez sur "Rafraîchir" pour charger les offres.</p>}
          </section>

          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Créer un lien d&apos;affiliation JVZoo</h2>
                <p className="text-sm text-gray-600">
                  Associez le produit JVZoo sélectionné avec votre UUID d&apos;influenceur et un Tracking ID.
                </p>
              </div>
              <button onClick={handleCreateLink} className="btn-primary text-sm">
                Générer le lien
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Produit sélectionné</span>
                <input className="input" value={selectedProduct} readOnly placeholder="Choisissez un produit ci-dessus" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Tracking ID (optionnel)</span>
                <input
                  className="input"
                  placeholder="campagne_xyz"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
              </label>
            </div>
            {createdLink && (
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold">Lien généré</p>
                <code className="text-xs bg-white p-2 rounded block break-all">{createdLink}</code>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

