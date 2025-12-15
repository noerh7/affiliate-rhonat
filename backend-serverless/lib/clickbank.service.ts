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
        this.devKey = process.env.CLICKBANK_DEV_KEY || '';
        this.apiKey = process.env.CLICKBANK_API_KEY || '';

        if (!this.devKey || !this.apiKey) {
            throw new Error('ClickBank credentials not configured');
        }

        this.axiosInstance = axios.create({
            baseURL: process.env.CLICKBANK_BASE_URL || 'https://api.clickbank.com',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Intercepteur pour ajouter l'authentification
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

    private generateAuthHeaders(): Record<string, string> {
        const credentials = `${this.devKey}:${this.apiKey}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');

        return {
            Authorization: `Basic ${encodedCredentials}`,
        };
    }

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

    async healthCheck(): Promise<{ status: string; message: string }> {
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
