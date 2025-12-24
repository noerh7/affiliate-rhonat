import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

interface Order {
    receipt: string;
    transactionTime: string;
    transactionType: string;
    vendor: string;
    productTitle: string;
    amount: number;
    currency: string;
    affiliate: string;
    trackingId?: string;
    [key: string]: any;
}

interface OrdersResponse {
    orders: Order[];
    totalCount?: number;
    page?: number;
}

interface OrderFilters {
    startDate?: string;
    endDate?: string;
    affiliate?: string;
    vendor?: string;
    role?: string;
    type?: string;
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

async function getOrders(
    apiKey: string,
    filters: OrderFilters = {}
): Promise<OrdersResponse> {
    // Backend déployé sur Vercel (URL en dur)
    const BACKEND_URL = 'https://affiliate-rhonat-delta.vercel.app';

    // Construire la clé API avec le préfixe API-
    const formattedApiKey = apiKey.startsWith('API-') ? apiKey : `API-${apiKey}`;

    // Construction des paramètres de requête
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.affiliate) params.append('affiliate', filters.affiliate);
    if (filters.vendor) params.append('vendor', filters.vendor);
    if (filters.role) params.append('role', filters.role);
    if (filters.type) params.append('type', filters.type);

    const url = `${BACKEND_URL}/api/clickbank/orders?${params.toString()}`;

    console.log('[ClickBank Orders] Calling:', url);
    console.log('[ClickBank Orders] Params:', Object.fromEntries(params));

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': formattedApiKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        console.log('[ClickBank Orders] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[ClickBank Orders] Error response:', errorText);
            throw new Error(`Backend API Error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        console.log('[ClickBank Orders] Response data:', result);

        // Le backend retourne { success: true, data: [...] } ou { orders: [...] }
        const orders = result.success ? result.data : (result.orders || result);

        return {
            orders: Array.isArray(orders) ? orders : [],
            totalCount: result.totalCount || result.count,
            page: result.page || 1,
        };
    } catch (error) {
        console.error('[ClickBank Orders] Error fetching orders:', error);
        throw error;
    }
}

function getDefaultDateRange(days = 30) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const format = (date: Date) => date.toISOString().slice(0, 10);
    return { start: format(start), end: format(end) };
}

// ============================================================================
// COMPOSANT
// ============================================================================

export default function ClickBankVente() {
    const { t } = useTranslation();
    const defaultRange = getDefaultDateRange();
    const developerKey = 'API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT';

    const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);
    const [loading, setLoading] = useState(false);
    const [ordersData, setOrdersData] = useState<OrdersResponse | null>(null);

    const [filters, setFilters] = useState({
        startDate: defaultRange.start,
        endDate: defaultRange.end,
        type: 'SALE',
        role: 'AFFILIATE',
    });

    async function handleGetOrders() {
        if (!developerKey) {
            setToast({ message: 'Clé API manquante', type: 'error' });
            return;
        }
        if (!filters.startDate || !filters.endDate) {
            setToast({ message: 'Veuillez définir une date de début et de fin.', type: 'error' });
            return;
        }

        setLoading(true);
        setOrdersData(null);

        try {
            const response = await getOrders(developerKey, filters);

            setOrdersData(response);
            setToast({
                message: `${response.orders.length} vente(s) récupérée(s)`,
                type: 'success',
            });
        } catch (error: any) {
            setToast({
                message: `Erreur: ${error.message}`,
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    }

    // Calculer les statistiques
    const stats = ordersData ? {
        totalOrders: ordersData.orders.length,
        totalRevenue: ordersData.orders.reduce((sum, order) => sum + (order.amount || 0), 0),
        avgOrderValue: ordersData.orders.length > 0
            ? ordersData.orders.reduce((sum, order) => sum + (order.amount || 0), 0) / ordersData.orders.length
            : 0,
    } : null;

    return (
        <div className="space-y-4">
            {/* En-tête */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold">Ventes ClickBank</h2>
                    <p className="text-sm text-gray-600">Récupérez l'historique de vos ventes</p>
                </div>
            </div>

            {/* Message d'information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-2">Endpoint en cours de configuration</h3>
                        <p className="text-sm text-blue-800 mb-2">
                            L'endpoint ClickBank pour récupérer les ventes est en cours de configuration.
                            L'API ClickBank nécessite des paramètres spécifiques qui sont en cours de vérification.
                        </p>
                        <p className="text-sm text-blue-800">
                            <strong>Alternative:</strong> Vous pouvez consulter vos ventes directement sur le
                            <a href="https://accounts.clickbank.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                                portail ClickBank
                            </a>
                        </p>
                    </div>
                </div>
            </div>


            {toast && (
                <div className={`p-4 rounded-lg ${toast.type === 'error' ? 'bg-red-50 text-red-800' :
                    toast.type === 'success' ? 'bg-green-50 text-green-800' :
                        'bg-blue-50 text-blue-800'
                    }`}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="text-sm font-medium hover:underline">
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* Formulaire de filtres */}
            <section className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Filtres</h3>
                    <button
                        onClick={handleGetOrders}
                        disabled={loading}
                        className="btn-primary text-sm"
                    >
                        {loading ? t('common.loading') : t('clickbank.getSales')}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-700">Date de début</span>
                        <input
                            type="date"
                            className="input"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-700">Date de fin</span>
                        <input
                            type="date"
                            className="input"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-700">Type de transaction</span>
                        <select
                            className="input"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="SALE">Ventes (SALE)</option>
                            <option value="RFND">Remboursements (RFND)</option>
                            <option value="CGBK">Chargebacks (CGBK)</option>
                            <option value="">Tous</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-700">Rôle</span>
                        <select
                            className="input"
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        >
                            <option value="AFFILIATE">Affilié</option>
                            <option value="VENDOR">Vendeur</option>
                        </select>
                    </label>
                </div>
            </section>

            {/* Résultats */}
            {ordersData && (
                <div className="space-y-4">
                    {/* Statistiques */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-xs text-blue-600 font-medium mb-1">Total Ventes</div>
                                <div className="text-2xl font-bold text-blue-700">{stats.totalOrders}</div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-xs text-green-600 font-medium mb-1">Revenu Total</div>
                                <div className="text-2xl font-bold text-green-700">${stats.totalRevenue.toFixed(2)}</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="text-xs text-purple-600 font-medium mb-1">Panier Moyen</div>
                                <div className="text-2xl font-bold text-purple-700">${stats.avgOrderValue.toFixed(2)}</div>
                            </div>
                        </div>
                    )}

                    {/* Tableau des ventes */}
                    <section className="card p-5">
                        <h3 className="text-lg font-semibold mb-4">Détails des ventes ({ordersData.orders.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Date</th>
                                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Reçu</th>
                                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Produit</th>
                                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Vendor</th>
                                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Montant</th>
                                        <th className="text-center p-3 text-sm font-semibold text-gray-700">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordersData.orders.map((order, index) => (
                                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-sm text-gray-600">
                                                {new Date(order.transactionTime).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="p-3">
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{order.receipt}</code>
                                            </td>
                                            <td className="p-3 text-sm font-medium text-gray-900">{order.productTitle}</td>
                                            <td className="p-3 text-sm text-gray-600">{order.vendor}</td>
                                            <td className="p-3 text-right">
                                                <span className="text-sm font-bold text-gray-900">
                                                    ${order.amount.toFixed(2)} {order.currency}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.transactionType === 'SALE' ? 'bg-green-100 text-green-800' :
                                                    order.transactionType === 'RFND' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.transactionType}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* JSON collapsible */}
                        <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 p-2 bg-gray-100 rounded">
                                📋 Voir les données JSON brutes
                            </summary>
                            <pre className="mt-2 bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96 border border-gray-200">
                                {JSON.stringify(ordersData, null, 2)}
                            </pre>
                        </details>
                    </section>
                </div>
            )}
        </div>
    );
}
