import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import Sidebar from '../components/Sidebar';
import { TrendingUp, DollarSign, ShoppingCart, Copy, Check, Code } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Conversion {
    id: string;
    link_id: string;
    order_id: string;
    amount: number;
    commission: number;
    created_at: string;
    affiliate_links: {
        code: string;
        products: {
            name: string;
        };
    };
}

interface ConversionStats {
    totalConversions: number;
    totalRevenue: number;
    totalCommission: number;
    conversionRate: number;
}

export default function Conversions() {
    const { t } = useTranslation();
    const [conversions, setConversions] = useState<Conversion[]>([]);
    const [stats, setStats] = useState<ConversionStats>({
        totalConversions: 0,
        totalRevenue: 0,
        totalCommission: 0,
        conversionRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [selectedLink, setSelectedLink] = useState<string>('');
    const [affiliateLinks, setAffiliateLinks] = useState<any[]>([]);
    const [pixelCode, setPixelCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [showPixelGenerator, setShowPixelGenerator] = useState(false);

    useEffect(() => {
        fetchConversions();
        fetchAffiliateLinks();
    }, []);

    const fetchAffiliateLinks = async () => {
        const { data } = await supabase
            .from('affiliate_links')
            .select('id, code, products(name)')
            .order('created_at', { ascending: false });

        if (data) setAffiliateLinks(data);
    };

    const fetchConversions = async () => {
        setLoading(true);

        // Récupérer les conversions
        const { data: salesData } = await supabase
            .from('sales')
            .select(`
        id,
        link_id,
        order_id,
        amount,
        commission,
        created_at,
        affiliate_links (
          code,
          products (
            name
          )
        )
      `)
            .order('created_at', { ascending: false });

        if (salesData) {
            setConversions(salesData as any);

            // Calculer les statistiques
            const totalConversions = salesData.length;
            const totalRevenue = salesData.reduce((sum: number, sale: any) => sum + sale.amount, 0);
            const totalCommission = salesData.reduce((sum: number, sale: any) => sum + sale.commission, 0);

            // Récupérer le nombre total de clics pour calculer le taux de conversion
            const { count: totalClicks } = await supabase
                .from('clicks')
                .select('*', { count: 'exact', head: true });

            const conversionRate = totalClicks ? (totalConversions / totalClicks) * 100 : 0;

            setStats({
                totalConversions,
                totalRevenue,
                totalCommission,
                conversionRate,
            });
        }

        setLoading(false);
    };

    const generatePixelCode = () => {
        if (!selectedLink) return;

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const pixelUrl = `${supabaseUrl}/functions/v1/record-sale`;

        // VERSION 1 : AUTOMATIQUE (RECOMMANDÉ) - Détecte automatiquement les infos
        const autoCode = `<!-- 🚀 VERSION AUTOMATIQUE (RECOMMANDÉ) - Copier-Coller, c'est tout ! -->
<!-- À placer sur votre page de confirmation (page "Merci") -->
<script id="rhonat-conversion-pixel">
(function() {
  // 🎯 Détection automatique de l'ID de commande
  // Le script cherche dans l'URL, les éléments de la page, etc.
  function detectOrderId() {
    // Chercher dans l'URL (?order_id=XXX ou ?order=XXX)
    var urlParams = new URLSearchParams(window.location.search);
    var orderId = urlParams.get('order_id') || urlParams.get('order') || urlParams.get('transaction_id');
    
    if (orderId) return orderId;
    
    // Chercher dans les éléments de la page
    var orderElement = document.querySelector('[data-order-id]') || 
                      document.querySelector('.order-id') ||
                      document.querySelector('#order-id');
    
    if (orderElement) {
      return orderElement.getAttribute('data-order-id') || 
             orderElement.textContent.trim();
    }
    
    // Générer un ID unique si rien trouvé
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  // 💰 Détection automatique du montant
  function detectAmount() {
    // Chercher dans l'URL (?amount=XXX ou ?total=XXX)
    var urlParams = new URLSearchParams(window.location.search);
    var amount = urlParams.get('amount') || urlParams.get('total') || urlParams.get('price');
    
    if (amount) return parseFloat(amount);
    
    // Chercher dans les éléments de la page
    var amountElement = document.querySelector('[data-amount]') || 
                       document.querySelector('.order-total') ||
                       document.querySelector('#order-total') ||
                       document.querySelector('.total-amount');
    
    if (amountElement) {
      var text = amountElement.getAttribute('data-amount') || 
                 amountElement.textContent;
      // Extraire le nombre (enlever €, $, etc.)
      var match = text.match(/[0-9]+([.,][0-9]+)?/);
      if (match) return parseFloat(match[0].replace(',', '.'));
    }
    
    return 0; // Valeur par défaut
  }
  
  // 📡 Envoi du pixel
  var orderId = detectOrderId();
  var amount = detectAmount();
  
  console.log('🎯 Pixel de conversion Rhonat:', { orderId: orderId, amount: amount });
  
  var img = new Image(1, 1);
  img.src = '${pixelUrl}?order_id=' + encodeURIComponent(orderId) + '&amount=' + amount;
  img.style.display = 'none';
  img.onerror = function() { console.error('❌ Erreur pixel Rhonat'); };
  img.onload = function() { console.log('✅ Pixel Rhonat chargé'); };
  document.body.appendChild(img);
})();
</script>`;

        // VERSION 2 : SEMI-AUTOMATIQUE - Juste indiquer où sont les infos
        const semiAutoCode = `<!-- 📋 VERSION SEMI-AUTOMATIQUE - Indiquer où sont les infos -->
<!-- Ajouter data-order-id et data-amount sur vos éléments existants -->

<!-- Exemple 1 : Sur un élément qui affiche l'ID de commande -->
<p data-order-id="12345">Commande #12345</p>

<!-- Exemple 2 : Sur un élément qui affiche le montant -->
<p data-amount="99.90">Total : 99,90€</p>

<!-- Puis coller ce script (il détectera automatiquement) -->
<script>
(function() {
  var orderElement = document.querySelector('[data-order-id]');
  var amountElement = document.querySelector('[data-amount]');
  
  var orderId = orderElement ? orderElement.getAttribute('data-order-id') : 'ORD-' + Date.now();
  var amount = amountElement ? parseFloat(amountElement.getAttribute('data-amount')) : 0;
  
  var img = new Image(1, 1);
  img.src = '${pixelUrl}?order_id=' + orderId + '&amount=' + amount;
  img.style.display = 'none';
  document.body.appendChild(img);
})();
</script>`;

        // VERSION 3 : MANUELLE - Pour ceux qui veulent tout contrôler
        const manualCode = `<!-- ⚙️ VERSION MANUELLE - Contrôle total -->
<script>
(function() {
  var orderId = '{{ORDER_ID}}'; // ⚠️ REMPLACER par votre ID de commande
  var amount = {{AMOUNT}}; // ⚠️ REMPLACER par le montant (nombre, sans guillemets)
  
  var img = new Image(1, 1);
  img.src = '${pixelUrl}?order_id=' + orderId + '&amount=' + amount;
  img.style.display = 'none';
  document.body.appendChild(img);
})();
</script>`;

        setPixelCode(`${autoCode}\n\n\n${semiAutoCode}\n\n\n${manualCode}`);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pixelCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="p-6 max-w-7xl mx-auto w-full">
                {/* En-tête */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('conversions.title')}
                    </h1>
                    <p className="text-gray-600">
                        Suivez vos ventes et générez des pixels de conversion pour vos pages de remerciement
                    </p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <ShoppingCart className="w-8 h-8 opacity-80" />
                            <span className="text-2xl font-bold">{stats.totalConversions}</span>
                        </div>
                        <p className="text-blue-100 text-sm">Total Conversions</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-8 h-8 opacity-80" />
                            <span className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</span>
                        </div>
                        <p className="text-green-100 text-sm">Revenu Total</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 opacity-80" />
                            <span className="text-2xl font-bold">${stats.totalCommission.toFixed(2)}</span>
                        </div>
                        <p className="text-purple-100 text-sm">Commission Totale</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 opacity-80" />
                            <span className="text-2xl font-bold">{stats.conversionRate.toFixed(2)}%</span>
                        </div>
                        <p className="text-orange-100 text-sm">Taux de Conversion</p>
                    </div>
                </div>

                {/* Générateur de Pixel */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Code className="w-6 h-6 text-indigo-600" />
                            <h2 className="text-xl font-bold text-gray-900">Générateur de Pixel de Conversion</h2>
                        </div>
                        <button
                            onClick={() => setShowPixelGenerator(!showPixelGenerator)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {showPixelGenerator ? 'Masquer' : 'Afficher'}
                        </button>
                    </div>

                    {showPixelGenerator && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sélectionner un lien d'affiliation
                                </label>
                                <select
                                    value={selectedLink}
                                    onChange={(e) => setSelectedLink(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">-- Choisir un lien --</option>
                                    {affiliateLinks.map((link) => (
                                        <option key={link.id} value={link.id}>
                                            {link.code} - {link.products?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={generatePixelCode}
                                disabled={!selectedLink}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Générer le Code Pixel
                            </button>

                            {pixelCode && (
                                <div className="relative">
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                        <pre className="text-sm">{pixelCode}</pre>
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-2 right-2 px-3 py-1 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copié !
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copier
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-3">📌 3 Versions Disponibles</h3>

                                <div className="space-y-4">
                                    {/* Version 1 : Automatique */}
                                    <div className="bg-white border border-green-200 rounded-lg p-3">
                                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                            🚀 Version 1 : AUTOMATIQUE (Recommandé)
                                        </h4>
                                        <p className="text-sm text-gray-700 mb-2">
                                            <strong>Le plus simple !</strong> Copier-coller le code, c'est tout.
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                            <li>Détecte automatiquement l'ID de commande dans l'URL ou la page</li>
                                            <li>Détecte automatiquement le montant dans l'URL ou la page</li>
                                            <li>Génère un ID unique si rien n'est trouvé</li>
                                            <li>Aucune modification nécessaire !</li>
                                        </ul>
                                        <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                                            ✅ <strong>Parfait pour :</strong> Les partenaires qui veulent la solution la plus simple
                                        </div>
                                    </div>

                                    {/* Version 2 : Semi-automatique */}
                                    <div className="bg-white border border-blue-200 rounded-lg p-3">
                                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                            📋 Version 2 : SEMI-AUTOMATIQUE
                                        </h4>
                                        <p className="text-sm text-gray-700 mb-2">
                                            Ajouter 2 attributs sur vos éléments HTML existants.
                                        </p>
                                        <div className="bg-gray-50 p-2 rounded text-xs font-mono mb-2">
                                            &lt;p <span className="text-blue-600">data-order-id="12345"</span>&gt;Commande #12345&lt;/p&gt;<br />
                                            &lt;p <span className="text-blue-600">data-amount="99.90"</span>&gt;Total : 99,90€&lt;/p&gt;
                                        </div>
                                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                            ✅ <strong>Parfait pour :</strong> Les partenaires qui ont déjà ces infos affichées sur leur page
                                        </div>
                                    </div>

                                    {/* Version 3 : Manuelle */}
                                    <div className="bg-white border border-orange-200 rounded-lg p-3">
                                        <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                            ⚙️ Version 3 : MANUELLE
                                        </h4>
                                        <p className="text-sm text-gray-700 mb-2">
                                            Remplacer manuellement les valeurs dans le code.
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                            <li>Remplacer <code className="bg-orange-100 px-1 rounded">{'{{ORDER_ID}}'}</code> par l'ID réel</li>
                                            <li>Remplacer <code className="bg-orange-100 px-1 rounded">{'{{AMOUNT}}'}</code> par le montant réel</li>
                                        </ul>
                                        <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-700">
                                            ✅ <strong>Parfait pour :</strong> Les partenaires qui veulent un contrôle total
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ <strong>Important :</strong> Le pixel utilise le cookie <code>aff_link_id</code> défini lors du clic sur le lien d'affiliation.
                                        Assurez-vous que l'utilisateur a cliqué sur un lien d'affiliation avant d'arriver sur la page de confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Liste des conversions */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Historique des Conversions</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
                    ) : conversions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Aucune conversion enregistrée pour le moment
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Lien
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID Commande
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Montant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Commission
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {conversions.map((conversion) => (
                                        <tr key={conversion.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(conversion.created_at).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {conversion.affiliate_links?.products?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                                    {conversion.affiliate_links?.code || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {conversion.order_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                ${conversion.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                                                ${conversion.commission.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
