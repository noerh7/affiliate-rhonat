import axios, { AxiosInstance, AxiosError } from 'axios';
import crypto from 'crypto';
import config from '../config/env';
import {
    ClickBankOrder,
    ClickBankProduct,
    ClickBankAnalytics,
    ClickBankError,
} from '../types/clickbank.types';

class ClickBankService {
    private axiosInstance: AxiosInstance;
    private devKey: string;
    private apiKey: string;

    constructor() {
        this.devKey = config.clickbank.devKey;
        this.apiKey = config.clickbank.apiKey;

        this.axiosInstance = axios.create({
            baseURL: config.clickbank.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Intercepteur pour ajouter l'authentification à chaque requête
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const authHeaders = this.generateAuthHeaders();
                Object.entries(authHeaders).forEach(([key, value]) => {
                    config.headers.set(key, value);
                });
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    /**
     * Génère les headers d'authentification pour ClickBank
     * ClickBank utilise la clé API directement dans le header Authorization
     * Format: Authorization: API-xxxxx (pas de Basic Auth, pas de base64)
     */
    private generateAuthHeaders(): Record<string, string> {
        // S'assurer que la clé API a le préfixe "API-"
        const apiKey = this.apiKey.startsWith('API-')
            ? this.apiKey
            : `API-${this.apiKey}`;

        return {
            'Authorization': apiKey,
            'Accept': 'application/json',
        };
    }

    /**
     * Gestion centralisée des erreurs
     */
    private handleError(error: unknown): ClickBankError {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            return {
                error: 'ClickBank API Error',
                message: axiosError.message,
                statusCode: axiosError.response?.status || 500,
            };
        }

        return {
            error: 'Unknown Error',
            message: 'An unexpected error occurred',
            statusCode: 500,
        };
    }

    /**
     * Récupère les commandes
     * @param startDate - Date de début (format: YYYY-MM-DD)
     * @param endDate - Date de fin (format: YYYY-MM-DD)
     * @param options - Options de filtrage (role, type, affiliate, vendor)
     */
    async getOrders(
        startDate?: string,
        endDate?: string,
        options?: {
            role?: string;
            type?: string;
            affiliate?: string;
            vendor?: string;
            page?: number;
        }
    ): Promise<ClickBankOrder[] | ClickBankError> {
        try {
            const params: Record<string, string> = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (options?.role) params.role = options.role;
            if (options?.type) params.type = options.type;
            if (options?.affiliate) params.affiliate = options.affiliate;
            if (options?.vendor) params.vendor = options.vendor;

            console.log('[ClickBank Service] Calling /rest/1.3/orders2/list with params:', params);

            // Selon la doc: pagination via header 'Page'
            const headers: Record<string, string> = {};
            if (options?.page) {
                headers['Page'] = String(options.page);
            }

            const response = await this.axiosInstance.get('/rest/1.3/orders2/list', {
                params,
                headers,
            });

            console.log('[ClickBank Service] Orders response status:', response.status);
            console.log('[ClickBank Service] Orders response data keys:', Object.keys(response.data || {}));

            // Selon la doc: la réponse contient orderData (peut être un tableau ou un objet unique)
            let orders: any[] = [];

            if (response.data) {
                if (Array.isArray(response.data.orderData)) {
                    orders = response.data.orderData;
                } else if (response.data.orderData) {
                    // Si c'est un seul objet, le mettre dans un tableau
                    orders = [response.data.orderData];
                } else if (Array.isArray(response.data)) {
                    orders = response.data;
                }
            }

            console.log('[ClickBank Service] Parsed orders count:', orders.length);
            return orders;
        } catch (error: any) {
            console.error('[ClickBank Service] Error in getOrders:', error);
            console.error('[ClickBank Service] Error response:', error.response?.data);
            console.error('[ClickBank Service] Error status:', error.response?.status);
            return this.handleError(error);
        }
    }

    /**
     * Récupère les produits disponibles
     */
    async getProducts(): Promise<ClickBankProduct[] | ClickBankError> {
        try {
            const response = await this.axiosInstance.get(
                '/rest/1.3/products/listings'
            );

            return response.data.products || [];
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Récupère un produit spécifique par son ID
     * @param productId - ID du produit
     */
    async getProductById(
        productId: string
    ): Promise<ClickBankProduct | ClickBankError> {
        try {
            const response = await this.axiosInstance.get(
                `/rest/1.3/products/${productId}`
            );

            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Récupère les analytics/statistiques
     * @param startDate - Date de début
     * @param endDate - Date de fin
     * @param options - Options supplémentaires (role, dimension, tid, account, select)
     */
    async getAnalytics(
        startDate: string,
        endDate: string,
        options?: {
            role?: string;
            dimension?: string;
            tid?: string;
            account?: string;
            select?: string;
        }
    ): Promise<any | ClickBankError> {
        try {
            // Valeurs par défaut
            const role = (options?.role || 'AFFILIATE').toLowerCase();
            const dimension = (options?.dimension || 'TRACKING_ID').toLowerCase();
            const account = options?.account || 'freenzy';
            const select = options?.select || 'HOP_COUNT,SALE_COUNT';

            // Construction de l'URL de l'endpoint
            const endpoint = `/rest/1.3/analytics/${role}/${dimension}`;

            // Construction des paramètres de requête
            const params: Record<string, string> = {
                startDate,
                endDate,
                select,
            };

            // Ajouter le paramètre account si la dimension est vendor
            if (dimension === 'vendor') {
                params.account = account;
            }

            // Ajouter le tracking ID si fourni
            if (options?.tid) {
                params.tid = options.tid;
            }

            console.log(`[ClickBank Service] Calling ${endpoint} with params:`, params);

            const response = await this.axiosInstance.get(endpoint, { params });

            console.log(`[ClickBank Service] Response status:`, response.status);

            // Retourner la réponse brute pour que le frontend puisse la traiter
            return response.data;
        } catch (error) {
            console.error('[ClickBank Service] Error in getAnalytics:', error);
            return this.handleError(error);
        }
    }

    /**
     * Vérifie la santé de la connexion à l'API ClickBank
     */
    async healthCheck(): Promise<{ status: string; message: string }> {
        try {
            // Utiliser l'endpoint affiliate analytics pour vérifier la connexion
            const today = new Date().toISOString().split('T')[0];
            await this.axiosInstance.get(
                '/rest/1.3/analytics/affiliate/vendor',
                {
                    params: {
                        account: 'freenzy',
                        startDate: today,
                        endDate: today,
                        select: 'HOP_COUNT',
                    },
                }
            );
            return {
                status: 'ok',
                message: 'ClickBank API is reachable',
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Cannot reach ClickBank API',
            };
        }
    }
}

// Export d'une instance singleton
export default new ClickBankService();
