import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

export default function TestSalePixel() {
    const { t } = useTranslation();
    const [orderId, setOrderId] = useState<string>('');
    const [amount, setAmount] = useState<string>('99.90');
    const [pixelUrl, setPixelUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [pixelFired, setPixelFired] = useState(false);
    const [cookieValue, setCookieValue] = useState<string>('');

    useEffect(() => {
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

    const generatePixelUrl = () => {
        if (!orderId || !amount) {
            setResult({ success: false, message: 'Veuillez remplir l\'ID de commande et le montant' });
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setResult({ success: false, message: 'Le montant doit être un nombre positif' });
            return;
        }

        if (!cookieValue) {
            setResult({
                success: false,
                message: 'Aucun cookie aff_link_id trouvé. Veuillez d\'abord cliquer sur un lien d\'affiliation ou utiliser la page /test-sale pour créer un cookie.'
            });
            return;
        }

        // Récupérer l'URL Supabase depuis les variables d'environnement
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

        if (!supabaseUrl) {
            setResult({
                success: false,
                message: 'Variable d\'environnement VITE_SUPABASE_URL manquante.'
            });
            return;
        }

        // Générer l'URL du pixel de tracking
        const url = `${supabaseUrl}/functions/v1/record-sale?order_id=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amountNum)}`;
        setPixelUrl(url);
        setResult({
            success: true,
            message: 'URL du pixel générée avec succès ! Le link_id sera automatiquement lu depuis le cookie.'
        });
    };

    const firePixel = async () => {
        if (!pixelUrl) {
            setResult({ success: false, message: 'Veuillez d\'abord générer l\'URL du pixel' });
            return;
        }

        setLoading(true);
        setResult(null);
        setPixelFired(false);

        try {
            // Créer une image invisible pour déclencher le pixel
            const img = new Image();

            img.onload = () => {
                setPixelFired(true);
                setResult({
                    success: true,
                    message: `Pixel déclenché avec succès ! Order ID: ${orderId}, Montant: ${amount}€`
                });
                setLoading(false);
            };

            img.onerror = () => {
                setPixelFired(false);
                setResult({
                    success: false,
                    message: 'Erreur lors du déclenchement du pixel. Vérifiez que l\'Edge Function est déployée.'
                });
                setLoading(false);
            };

            // Déclencher le pixel
            img.src = pixelUrl;

            // Timeout de sécurité
            setTimeout(() => {
                if (loading) {
                    setLoading(false);
                    if (!pixelFired) {
                        setResult({
                            success: false,
                            message: 'Timeout : Le pixel n\'a pas répondu dans les délais.'
                        });
                    }
                }
            }, 10000); // 10 secondes

        } catch (error: any) {
            console.error('Erreur complète:', error);
            setResult({
                success: false,
                message: `Erreur: ${error.message || 'Erreur de connexion'}`
            });
            setLoading(false);
        }
    };

    const resetForm = () => {
        setOrderId('');
        setAmount('99.90');
        setPixelUrl('');
        setResult(null);
        setPixelFired(false);
    };

    return (
        <div className="flex">
            <Sidebar />
            <main className="p-6 w-full max-w-4xl">
                <h1 className="text-2xl font-bold mb-6">{t('testSalePixel.title')}</h1>

                <div className={`p-4 rounded border mb-6 ${cookieValue
                    ? 'bg-green-50 border-green-200'
                    : 'bg-orange-50 border-orange-200'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <strong className={cookieValue ? 'text-green-800' : 'text-orange-800'}>
                                {cookieValue ? '✓ Cookie détecté' : '⚠️ Aucun cookie détecté'}
                            </strong>
                            <p className={`text-sm mt-1 ${cookieValue ? 'text-green-700' : 'text-orange-700'}`}>
                                {cookieValue
                                    ? `Link ID: ${cookieValue.substring(0, 20)}${cookieValue.length > 20 ? '...' : ''}`
                                    : 'Vous devez d\'abord cliquer sur un lien d\'affiliation pour créer un cookie.'
                                }
                            </p>
                        </div>
                        <button
                            onClick={checkCookie}
                            className={`px-3 py-1 text-sm rounded ${cookieValue
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-orange-600 hover:bg-orange-700 text-white'
                                }`}
                        >
                            Actualiser
                        </button>
                    </div>
                    {!cookieValue && (
                        <p className="text-xs text-orange-600 mt-2">
                            💡 Astuce : Utilisez la page <a href="/test-sale" className="underline font-semibold">/test-sale</a> pour créer un cookie de test.
                        </p>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-sm text-blue-800">
                    <strong>💡 À propos du Pixel de Tracking :</strong>
                    <p className="mt-2">
                        Le pixel de tracking est une image invisible (1x1 pixel) qui est chargée sur la page de confirmation de commande.
                        Lorsque le pixel se charge, il envoie automatiquement les informations de la vente (Order ID et Montant) au serveur
                        pour enregistrer la vente et calculer la commission de l'affilié.
                    </p>
                    <p className="mt-2">
                        Cette méthode est couramment utilisée dans le marketing d'affiliation car elle ne nécessite pas d'interaction
                        de l'utilisateur et fonctionne même si JavaScript est désactivé.
                    </p>
                    <p className="mt-2 font-semibold">
                        🔑 Le link_id est automatiquement lu depuis le cookie <code className="bg-blue-100 px-1 rounded">aff_link_id</code> créé lors du clic sur le lien d'affiliation.
                    </p>
                </div>

                <div className="bg-white p-6 shadow rounded mb-6">
                    <h2 className="text-lg font-semibold mb-4">1. Informations de la vente</h2>
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
                            onClick={generatePixelUrl}
                            disabled={!orderId || !amount}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Générer l'URL du Pixel
                        </button>
                    </div>
                </div>

                {pixelUrl && (
                    <div className="bg-white p-6 shadow rounded mb-6">
                        <h2 className="text-lg font-semibold mb-4">2. URL du Pixel générée</h2>
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded border border-gray-200 break-all text-sm font-mono">
                                {pixelUrl}
                            </div>
                            <p className="text-sm text-gray-600">
                                Cette URL peut être utilisée comme source d'une balise <code className="bg-gray-200 px-1 rounded">&lt;img&gt;</code>
                                sur votre page de confirmation de commande.
                            </p>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Exemple d'intégration HTML :</p>
                                <code className="text-xs block bg-white p-2 rounded border border-gray-300 overflow-x-auto">
                                    &lt;img src="{pixelUrl}" width="1" height="1" style="display:none;" alt="" /&gt;
                                </code>
                            </div>
                        </div>
                    </div>
                )}

                {pixelUrl && (
                    <div className="bg-white p-6 shadow rounded mb-6">
                        <h2 className="text-lg font-semibold mb-4">3. Déclencher le Pixel</h2>
                        <div className="space-y-3">
                            <button
                                onClick={firePixel}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('common.loading') : t('testSalePixel.firePixel')}
                            </button>
                            <p className="text-sm text-gray-600">
                                Cliquez sur ce bouton pour simuler le chargement du pixel et enregistrer la vente.
                            </p>
                        </div>
                    </div>
                )}

                {result && (
                    <div className={`p-4 rounded border ${result.success
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <strong>{result.success ? '✓ Succès' : '✗ Erreur'}</strong>
                        <p className="mt-1">{result.message}</p>
                        {result.success && (
                            <button
                                onClick={resetForm}
                                className="mt-3 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                                Nouveau Test
                            </button>
                        )}
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded mt-6 text-sm text-gray-600">
                    <h3 className="font-semibold mb-2">Informations techniques :</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Le pixel utilise l'Edge Function : <code className="bg-gray-200 px-1 rounded">/functions/v1/record-sale</code></li>
                        <li>Les paramètres sont passés via l'URL (query string)</li>
                        <li>Le cookie <code className="bg-gray-200 px-1 rounded">aff_link_id</code> doit être présent dans le navigateur</li>
                        <li>La commission est calculée automatiquement selon le pourcentage du produit</li>
                        <li>Vous pouvez vérifier les ventes dans le dashboard affilié</li>
                    </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4 text-sm text-yellow-800">
                    <strong>⚠️ Prérequis :</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>L'Edge Function <code className="bg-yellow-100 px-1 rounded">record-sale</code> doit être déployée sur Supabase</li>
                        <li>Un cookie <code className="bg-yellow-100 px-1 rounded">aff_link_id</code> valide doit exister (utilisez la page /test-sale pour en créer un)</li>
                        <li>Vérifiez que <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_URL</code> est bien définie</li>
                    </ol>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded p-4 mt-4 text-sm text-purple-800">
                    <strong>🔗 Intégration dans votre site :</strong>
                    <p className="mt-2">
                        Pour intégrer ce pixel sur votre page de confirmation de commande, ajoutez simplement la balise
                        <code className="bg-purple-100 px-1 rounded mx-1">&lt;img&gt;</code> générée ci-dessus dans votre HTML.
                        Remplacez les valeurs <code className="bg-purple-100 px-1 rounded">order_id</code> et
                        <code className="bg-purple-100 px-1 rounded mx-1">amount</code> par les valeurs dynamiques de votre commande.
                    </p>
                </div>
            </main>
        </div>
    );
}
