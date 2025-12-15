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
     * ClickBank utilise une authentification basique avec Dev Key et API Key
     */
    private generateAuthHeaders(): Record<string, string> {
        // ClickBank utilise une authentification basique
        // Format: "DEV_KEY:API_KEY" encodé en base64
        const credentials = `${this.devKey}:${this.apiKey}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');

        return {
            Authorization: `Basic ${encodedCredentials}`,
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
     */
    async getOrders(
        startDate?: string,
        endDate?: string
    ): Promise<ClickBankOrder[] | ClickBankError> {
        try {
            const params: Record<string, string> = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await this.axiosInstance.get('/rest/1.3/orders', {
                params,
            });

            return response.data.orderData || [];
        } catch (error) {
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
     */
    async getAnalytics(
        startDate: string,
        endDate: string
    ): Promise<ClickBankAnalytics | ClickBankError> {
        try {
            const response = await this.axiosInstance.get('/rest/1.3/analytics', {
                params: { startDate, endDate },
            });

            return {
                totalSales: response.data.totalSales || 0,
                totalCommissions: response.data.totalCommissions || 0,
                totalOrders: response.data.totalOrders || 0,
                period: {
                    startDate,
                    endDate,
                },
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Vérifie la santé de la connexion à l'API ClickBank
     */
    async healthCheck(): Promise<{ status: string; message: string }> {
        try {
            // Tentative de récupération des produits pour vérifier la connexion
            await this.axiosInstance.get('/rest/1.3/products/listings');
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
