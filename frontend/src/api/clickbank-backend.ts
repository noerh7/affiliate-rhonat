/**
 * API frontend vers le backend ClickBank déployé sur Vercel
 * (ex: https://affiliate-rhonat-delta.vercel.app).
 *
 * Ce backend agrège déjà les données ClickBank (ventes, CA, commissions, ...),
 * ce qui évite d'appeler directement l'API ClickBank depuis le navigateur.
 */

const envVars =
  typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

const BACKEND_BASE_URL =
  envVars.VITE_CLICKBANK_BACKEND_URL || 'https://affiliate-rhonat-delta.vercel.app';

export interface BackendOrderCustomerAddress {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  postalCode?: string;
}

export interface BackendOrderCustomer {
  billing: BackendOrderCustomerAddress;
  shipping: BackendOrderCustomerAddress;
}

export interface BackendOrderLineItem {
  itemNo: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BackendOrder {
  receipt: string;
  transactionType: string;
  vendor: string;
  affiliate: string;
  role: string;
  totalAccountAmount: number;
  paymentMethod: string;
  totalOrderAmount: number;
  totalTaxAmount: number;
  totalShippingAmount: number;
  currency: string;
  orderLanguage: string;
  lineItems: BackendOrderLineItem[];
  customer: BackendOrderCustomer;
}

export interface BackendOrdersResponse {
  success: boolean;
  count: number;
  data: BackendOrder[];
}

export interface BackendAnalytics {
  totalSales: number;
  totalCommissions: number;
  totalOrders: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface BackendAnalyticsResponse {
  success: boolean;
  data: BackendAnalytics;
}

async function handleBackendResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return json as T;
}

/**
 * Récupère les commandes ClickBank entre deux dates via le backend Vercel.
 */
export async function fetchBackendOrders(params: {
  startDate?: string;
  endDate?: string;
}): Promise<BackendOrdersResponse> {
  const url = new URL('/api/clickbank/orders', BACKEND_BASE_URL);
  if (params.startDate) url.searchParams.set('startDate', params.startDate);
  if (params.endDate) url.searchParams.set('endDate', params.endDate);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleBackendResponse<BackendOrdersResponse>(res);
}

/**
 * Récupère un résumé analytics (ventes, CA, commissions) entre deux dates
 * via le backend Vercel.
 */
export async function fetchBackendAnalytics(params: {
  startDate: string;
  endDate: string;
}): Promise<BackendAnalyticsResponse> {
  const url = new URL('/api/clickbank/analytics', BACKEND_BASE_URL);
  url.searchParams.set('startDate', params.startDate);
  url.searchParams.set('endDate', params.endDate);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleBackendResponse<BackendAnalyticsResponse>(res);
}


