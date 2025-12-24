import { useEffect, useState } from 'react';
import { getAffiliateLinks } from '../api/affiliate';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

export default function TestSale() {
  const { t } = useTranslation();
  const [links, setLinks] = useState<any[]>([]);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [amount, setAmount] = useState<string>('99.90');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [cookieValue, setCookieValue] = useState<string>('');

  useEffect(() => {
    getAffiliateLinks().then(({ data }) => {
      setLinks(data ?? []);
      if (data && data.length > 0) {
        setSelectedLink(data[0]);
      }
    });
    checkCookie();
  }, []);

  const checkCookie = () => {
    const cookies = document.cookie.split(';');
    const affCookie = cookies.find(c => c.trim().startsWith('aff_link_id='));
    if (affCookie) {
      const value = affCookie.split('=')[1];
      setCookieValue(value);
    } else {
      setCookieValue('');
    }
  };

  const simulateClick = () => {
    if (!selectedLink) return;

    // Créer le cookie comme le ferait le système réel
    const COOKIE_NAME = 'aff_link_id';
    const COOKIE_VALUE = selectedLink.id;
    const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 jours
    document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;

    checkCookie();
    setResult({ success: true, message: `Cookie créé avec le link_id: ${selectedLink.id}` });
  };

  const testSale = async () => {
    if (!selectedLink) {
      setResult({ success: false, message: 'Veuillez sélectionner un lien d\'affiliation' });
      return;
    }

    if (!orderId || !amount) {
      setResult({ success: false, message: 'Veuillez remplir l\'ID de commande et le montant' });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setResult({ success: false, message: 'Le montant doit être un nombre positif' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Récupérer l'URL Supabase depuis les variables d'environnement
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setResult({
          success: false,
          message: 'Variables d\'environnement manquantes. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
        });
        setLoading(false);
        return;
      }

      // Essayer d'abord l'Edge Function
      const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/record-sale`;

      try {
        const response = await fetch(edgeFunctionEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            link_id: selectedLink.id,
            order_id: orderId,
            amount: amountNum
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setResult({
            success: true,
            message: `Vente enregistrée avec succès via Edge Function ! Order ID: ${orderId}, Montant: ${amountNum}€`
          });
          setOrderId('');
          setAmount('99.90');
          setLoading(false);
          return;
        } else {
          // Si l'Edge Function échoue, essayer l'API REST directe
          throw new Error(`Edge Function non disponible (${response.status})`);
        }
      } catch (edgeError: any) {
        // Fallback 1 : Essayer la fonction RPC record_sale
        console.log('Edge Function non disponible, essai de la fonction RPC record_sale');

        try {
          const { supabase } = await import('../api/supabase');

          const { data, error: rpcError } = await supabase.rpc('record_sale', {
            p_link_id: selectedLink.id,
            p_order_id: orderId,
            p_amount: amountNum
          });

          if (rpcError) {
            // Si la fonction n'existe pas, essayer l'API REST directe
            if (rpcError.message?.includes('Could not find the function') || rpcError.message?.includes('function record_sale')) {
              throw new Error('FUNCTION_NOT_FOUND');
            }
            throw rpcError;
          }

          if (!data || !data.success) {
            throw new Error(data?.error || 'Erreur lors de l\'enregistrement de la vente');
          }

          setResult({
            success: true,
            message: `Vente enregistrée avec succès via fonction RPC ! Order ID: ${orderId}, Montant: ${amountNum}€, Commission: ${data.commission?.toFixed(2)}€`
          });
          setOrderId('');
          setAmount('99.90');
          setLoading(false);
          return;
        } catch (rpcError: any) {
          // Fallback 2 : Utiliser l'API REST directe (si les politiques RLS le permettent)
          if (rpcError.message === 'FUNCTION_NOT_FOUND') {
            console.log('Fonction RPC non disponible, utilisation de l\'API REST directe');

            // Récupérer le produit pour calculer la commission
            const productResponse = await fetch(
              `${supabaseUrl}/rest/v1/products?id=eq.${selectedLink.product_id}&select=commission_percent`,
              {
                headers: {
                  'apikey': supabaseAnonKey,
                  'Authorization': `Bearer ${supabaseAnonKey}`,
                }
              }
            );

            if (!productResponse.ok) {
              throw new Error('Impossible de récupérer les informations du produit');
            }

            const products = await productResponse.json();
            if (!products || products.length === 0) {
              throw new Error('Produit non trouvé');
            }

            const product = products[0];
            const commission = (amountNum * product.commission_percent) / 100;

            // Insérer directement dans la table sales (avec les politiques RLS)
            const salesResponse = await fetch(
              `${supabaseUrl}/rest/v1/sales`,
              {
                method: 'POST',
                headers: {
                  'apikey': supabaseAnonKey,
                  'Authorization': `Bearer ${supabaseAnonKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=representation',
                },
                body: JSON.stringify({
                  link_id: selectedLink.id,
                  order_id: orderId,
                  amount: amountNum,
                  commission: commission,
                }),
              }
            );

            if (!salesResponse.ok) {
              const errorText = await salesResponse.text();
              throw new Error(`Erreur API REST: ${salesResponse.status} - ${errorText}. Assurez-vous d'avoir exécuté la migration 11_allow_sales_insert.sql pour créer les politiques RLS.`);
            }

            setResult({
              success: true,
              message: `Vente enregistrée avec succès via API REST ! Order ID: ${orderId}, Montant: ${amountNum}€, Commission: ${commission.toFixed(2)}€`
            });
            setOrderId('');
            setAmount('99.90');
            setLoading(false);
            return;
          }
          throw rpcError;
        }
      }
    } catch (error: any) {
      console.error('Erreur complète:', error);
      let errorMessage = error.message || 'Erreur de connexion';

      // Messages d'erreur plus explicites
      if (error.message?.includes('permission denied') || error.message?.includes('new row violates row-level security')) {
        errorMessage = 'Permission refusée. Vérifiez que la migration 11_allow_sales_insert.sql a été exécutée pour permettre l\'insertion de ventes.';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        errorMessage = 'Connexion bloquée. Vérifiez que l\'Edge Function record-sale est déployée sur Supabase, ou que les politiques RLS permettent l\'insertion.';
      }

      setResult({
        success: false,
        message: `Erreur: ${errorMessage}`
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCookie = () => {
    document.cookie = 'aff_link_id=; Path=/; Max-Age=0';
    checkCookie();
    setResult({ success: true, message: 'Cookie supprimé' });
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-6 w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">{t('testSale.title')}</h1>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-sm text-blue-800">
          <strong>💡 Comment tester :</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Sélectionnez un lien d'affiliation ci-dessous</li>
            <li>Cliquez sur "Simuler un clic" pour créer le cookie d'affiliation</li>
            <li>Remplissez les informations de la vente (Order ID et Montant)</li>
            <li>Cliquez sur "Tester l'enregistrement de la vente"</li>
            <li>Vérifiez dans votre dashboard que la vente apparaît bien</li>
          </ol>
        </div>

        <div className="bg-white p-6 shadow rounded mb-6">
          <h2 className="text-lg font-semibold mb-4">1. Sélectionner un lien d'affiliation</h2>
          <select
            className="w-full p-2 border rounded"
            value={selectedLink?.id || ''}
            onChange={(e) => {
              const link = links.find(l => l.id === e.target.value);
              setSelectedLink(link || null);
            }}
          >
            {links.length === 0 && <option value="">Aucun lien disponible</option>}
            {links.map((link) => (
              <option key={link.id} value={link.id}>
                {link.code} (ID: {link.id.substring(0, 8)}...)
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-6 shadow rounded mb-6">
          <h2 className="text-lg font-semibold mb-4">2. Simuler un clic (créer le cookie)</h2>
          <div className="space-y-3">
            <button
              onClick={simulateClick}
              disabled={!selectedLink}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simuler un clic
            </button>
            <div className="text-sm text-gray-600">
              <p><strong>Cookie actuel :</strong> {cookieValue || 'Aucun cookie trouvé'}</p>
              {cookieValue && (
                <button
                  onClick={clearCookie}
                  className="mt-2 text-red-600 hover:text-red-800 text-xs underline"
                >
                  Supprimer le cookie
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded mb-6">
          <h2 className="text-lg font-semibold mb-4">3. Tester l'enregistrement d'une vente</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order ID (ID de commande)
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ORDER_123"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="99.90"
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={testSale}
              disabled={loading || !selectedLink || !orderId || !amount}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('testSale.testSale')}
            </button>
          </div>
        </div>

        {result && (
          <div className={`p-4 rounded border ${result.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            <strong>{result.success ? '✓ Succès' : '✗ Erreur'}</strong>
            <p className="mt-1">{result.message}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded mt-6 text-sm text-gray-600">
          <h3 className="font-semibold mb-2">Informations techniques :</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Le système essaie d'abord l'Edge Function : <code className="bg-gray-200 px-1 rounded">/functions/v1/record-sale</code></li>
            <li>Si l'Edge Function n'est pas disponible, il utilise l'API REST Supabase directement</li>
            <li>Le cookie <code className="bg-gray-200 px-1 rounded">aff_link_id</code> est valide pendant 30 jours</li>
            <li>La commission est calculée automatiquement selon le pourcentage du produit</li>
            <li>Vous pouvez vérifier les ventes dans le dashboard affilié</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4 text-sm text-yellow-800">
          <strong>⚠️ Si vous obtenez une erreur "Failed to fetch" :</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li><strong>Option 1 (Recommandé)</strong> : Déployez l'Edge Function <code className="bg-yellow-100 px-1 rounded">record-sale</code> sur Supabase</li>
            <li><strong>Option 2</strong> : Exécutez la migration <code className="bg-yellow-100 px-1 rounded">11_allow_sales_insert.sql</code> pour permettre l'insertion via l'API REST</li>
            <li>Vérifiez que <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_URL</code> et <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> sont bien définies</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

