import axios, { AxiosInstance, AxiosError } from 'axios';
import {
    ClickBankOrder,
    ClickBankProduct,
    ClickBankAnalytics,
    ClickBankError,
} from './types';

class ClickBankService {
    private axiosInstance: AxiosInstance;
    private devKey: string;
    private apiKey: string;

    constructor() {
        console.log('[ClickBankService] Constructor called');
        console.log('[ClickBankService] Environment check:', {
            hasDevKey: !!process.env.CLICKBANK_DEV_KEY,
            hasApiKey: !!process.env.CLICKBANK_API_KEY,
            baseUrl: process.env.CLICKBANK_BASE_URL || 'https://api.clickbank.com',
        });

        this.devKey = process.env.CLICKBANK_DEV_KEY || '';
        this.apiKey = process.env.CLICKBANK_API_KEY || '';

        // Ne pas lancer d'erreur ici pour éviter de crasher la fonction serverless
        // Les erreurs seront gérées dans chaque méthode

        this.axiosInstance = axios.create({
            baseURL: process.env.CLICKBANK_BASE_URL || 'https://api.clickbank.com',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('[ClickBankService] Axios instance created');

        // Intercepteur pour ajouter l'authentification
        this.axiosInstance.interceptors.request.use(
            (config) => {
                console.log('[ClickBankService] Request interceptor - adding auth headers');
                const authHeaders = this.generateAuthHeaders();
                Object.entries(authHeaders).forEach(([key, value]) => {
                    config.headers.set(key, value);
                });
                console.log('[ClickBankService] Request config:', {
                    url: config.url,
                    method: config.method,
                    baseURL: config.baseURL,
                });
                return config;
            },
            (error) => {
                console.error('[ClickBankService] Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        console.log('[ClickBankService] Constructor completed');
    }

    private checkCredentials(): ClickBankError | null {
        if (!this.devKey || !this.apiKey) {
            return {
                error: 'Configuration Error',
                message: 'ClickBank credentials (CLICKBANK_DEV_KEY and CLICKBANK_API_KEY) are not configured. Please set them in your Vercel environment variables.',
                statusCode: 500,
            };
        }
        return null;
    }

    private generateAuthHeaders(): Record<string, string> {
        const credentials = `${this.devKey}:${this.apiKey}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');

        return {
            Authorization: `Basic ${encodedCredentials}`,
        };
    }

    private handleError(error: unknown): ClickBankError {
        console.error('[ClickBankService] handleError called with:', error);
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error('[ClickBankService] Axios error details:', {
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                config: {
                    url: axiosError.config?.url,
                    method: axiosError.config?.method,
                },
            });
            return {
                error: 'ClickBank API Error',
                message: axiosError.message,
                statusCode: axiosError.response?.status || 500,
            };
        }

        console.error('[ClickBankService] Unknown error type');
        return {
            error: 'Unknown Error',
            message: 'An unexpected error occurred',
            statusCode: 500,
        };
    }

    async getOrders(
        startDate?: string,
        endDate?: string
    ): Promise<ClickBankOrder[] | ClickBankError> {
        console.log('[ClickBankService] getOrders called', { startDate, endDate });
        const credError = this.checkCredentials();
        if (credError) {
            console.log('[ClickBankService] Credentials error:', credError);
            return credError;
        }

        try {
            const params: Record<string, string> = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            console.log('[ClickBankService] Making API request to /rest/1.3/orders');
            const response = await this.axiosInstance.get('/rest/1.3/orders', {
                params,
            });

            console.log('[ClickBankService] Orders response received:', {
                status: response.status,
                dataLength: response.data?.orderData?.length || 0,
            });
            return response.data.orderData || [];
        } catch (error) {
            console.error('[ClickBankService] getOrders error:', error);
            return this.handleError(error);
        }
    }

    async getProducts(): Promise<ClickBankProduct[] | ClickBankError> {
        console.log('[ClickBankService] getProducts called');
        const credError = this.checkCredentials();
        if (credError) {
            console.log('[ClickBankService] Credentials error:', credError);
            return credError;
        }

        try {
            console.log('[ClickBankService] Making API request to /rest/1.3/products/listings');
            const response = await this.axiosInstance.get(
                '/rest/1.3/products/listings'
            );

            console.log('[ClickBankService] Products response received:', {
                status: response.status,
                dataLength: response.data?.products?.length || 0,
            });
            return response.data.products || [];
        } catch (error) {
            console.error('[ClickBankService] getProducts error:', error);
            return this.handleError(error);
        }
    }

    async getProductById(
        productId: string
    ): Promise<ClickBankProduct | ClickBankError> {
        const credError = this.checkCredentials();
        if (credError) return credError;

        try {
            const response = await this.axiosInstance.get(
                `/rest/1.3/products/${productId}`
            );

            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getAnalytics(
        startDate: string,
        endDate: string
    ): Promise<ClickBankAnalytics | ClickBankError> {
        const credError = this.checkCredentials();
        if (credError) return credError;

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

    async healthCheck(): Promise<{ status: string; message: string }> {
        const credError = this.checkCredentials();
        if (credError) {
            return {
                status: 'error',
                message: credError.message,
            };
        }

        try {
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

export default ClickBankService;
