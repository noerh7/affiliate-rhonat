/**
 * Service API ClickBank
 * 
 * Ce service permet d'interagir avec l'API ClickBank pour :
 * - Récupérer les ventes avec détails complets
 * - Récupérer les statistiques de clics par lien d'affiliation
 * - Créer des liens d'affiliation (HopLinks)
 */

const envVars =
  typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

const CLICKBANK_API_BASE_URL =
  envVars.VITE_CLICKBANK_API_BASE_URL || 'https://api.clickbank.com/rest';

// IMPORTANT (dev & prod):
// On passe toujours par le backend Vercel, mais **via un chemin relatif /api**.
// En développement, Vite proxy redirige `/api/clickbank/...` vers
//   https://affiliate-rhonat-delta.vercel.app/api/clickbank/...
// ce qui évite les erreurs CORS côté navigateur tout en utilisant
// exclusivement le backend déployé.
const CLICKBANK_PROXY_URL = '/api/clickbank';
const DEFAULT_DEV_KEY = 'API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT';

function buildOrdersUrl(filters: OrderFilters) {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.affiliate) params.append('affiliate', filters.affiliate);
  if (filters.vendor) params.append('vendor', filters.vendor);
  if (filters.role) params.append('role', filters.role);
  if (filters.type) params.append('type', filters.type);
  if (filters.tid) params.append('tid', filters.tid);
  if (filters.page) params.append('page', String(filters.page));

  if (CLICKBANK_PROXY_URL) {
    const queryString = params.toString();
    return `${CLICKBANK_PROXY_URL}/orders${queryString ? `?${queryString}` : ''}`;
  }

  // Fallback théorique direct vers ClickBank (normalement non utilisé,
  // car on force le passage par le backend Vercel).
  const queryString = params.toString();
  return `${CLICKBANK_API_BASE_URL}/1.3/orders2/list${queryString ? `?${queryString}` : ''}`;
}

function buildAnalyticsUrl(filters: AnalyticsFilters) {
  const baseParams = new URLSearchParams();
  if (filters.startDate) baseParams.append('startDate', filters.startDate);
  if (filters.endDate) baseParams.append('endDate', filters.endDate);
  if (filters.trackingId) baseParams.append('tid', filters.trackingId);
  if (filters.account) baseParams.append('account', filters.account);
  if (filters.select) baseParams.append('select', filters.select);

  const role = filters.role || 'AFFILIATE';
  const dimension = filters.dimension || 'TRACKING_ID';

  if (CLICKBANK_PROXY_URL) {
    const backendParams = new URLSearchParams(baseParams);
    backendParams.append('role', role);
    backendParams.append('dimension', dimension);
    const queryString = backendParams.toString();
    return `${CLICKBANK_PROXY_URL}/analytics${queryString ? `?${queryString}` : ''}`;
  }

  const queryString = baseParams.toString();
  // Use lowercase for role and dimension in URL path as shown in working example
  const roleLower = role.toLowerCase();
  const dimensionLower = dimension.toLowerCase();
  return `${CLICKBANK_API_BASE_URL}/1.3/analytics/${roleLower}/${dimensionLower}${queryString ? `?${queryString}` : ''}`;
}

async function fetchWithFallback(
  url: string,
  init: RequestInit,
  fallbackUrl: string | null,
  hostedProxyUrl?: string
) {
  // #region agent log
  const logData1 = {location:'clickbank.ts:52',message:'fetchWithFallback entry',data:{url,fallbackUrl,hasHeaders:!!init.headers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
  console.log('[DEBUG]', logData1);
  fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData1)}).catch(()=>{});
  // #endregion
  try {
    // #region agent log
    const logData2 = {location:'clickbank.ts:54',message:'before fetch attempt',data:{url,method:init.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
    console.log('[DEBUG]', logData2);
    fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
    // #endregion

    const candidates = [url];
    if (hostedProxyUrl && hostedProxyUrl !== url) {
      candidates.push(hostedProxyUrl);
    }
    if (fallbackUrl && !candidates.includes(fallbackUrl)) {
      candidates.push(fallbackUrl);
    }
    // #region agent log
    const logCandidates = {location:'clickbank.ts:95',message:'candidates built',data:{candidates,count:candidates.length,url,hostedProxyUrl,fallbackUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    console.log('[DEBUG]', logCandidates);
    fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logCandidates)}).catch(()=>{});
    // #endregion

    let lastError: any = null;

    for (const targetUrl of candidates) {
      try {
        const res = await fetch(targetUrl, init);
        // Retry with fallback if the proxy itself is down/returns 5xx
        const shouldRetry = !res.ok &&
          (res.status === 500 || res.status === 502 || res.status === 503 || res.status === 404 || res.status === 401) &&
          targetUrl !== candidates[candidates.length - 1];
        // #region agent log
        const logRetryCheck = {location:'clickbank.ts:108',message:'retry check',data:{status:res.status,ok:res.ok,shouldRetry,isLastCandidate:targetUrl === candidates[candidates.length - 1],targetUrl,candidateIndex:candidates.indexOf(targetUrl),totalCandidates:candidates.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
        console.log('[DEBUG]', logRetryCheck);
        fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logRetryCheck)}).catch(()=>{});
        // #endregion
        if (shouldRetry) {
          // #region agent log
          const logDataRetry = {location:'clickbank.ts:107',message:'retrying with fallback due to error status',data:{status:res.status,targetUrl,nextCandidate:candidates[candidates.indexOf(targetUrl) + 1]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
          console.log('[DEBUG]', logDataRetry);
          fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataRetry)}).catch(()=>{});
          // #endregion
          lastError = new Error(`Upstream error ${res.status} on ${targetUrl}`);
          continue;
        }
        // #region agent log
        const logData3 = {location:'clickbank.ts:126',message:'after fetch',data:{status:res.status,ok:res.ok,statusText:res.statusText,url:res.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
        console.log('[DEBUG]', logData3);
        fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
        // #endregion
        return res;
      } catch (err) {
        lastError = err;
        // #region agent log
        const logDataErr = {location:'clickbank.ts:122',message:'fetch error in loop',data:{errorMessage:err instanceof Error?err.message:String(err),targetUrl,hasMoreCandidates:targetUrl !== candidates[candidates.length - 1],candidateIndex:candidates.indexOf(targetUrl)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
        console.log('[DEBUG]', logDataErr);
        fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataErr)}).catch(()=>{});
        // #endregion
        // Try the next candidate when connection fails (e.g., ECONNREFUSED on :3001)
        if (targetUrl !== candidates[candidates.length - 1]) {
          continue;
        }
        throw err;
      }
    }

    if (lastError) {
      throw lastError;
    }
    throw new Error('Unknown fetch failure');
  } catch (err) {
    // #region agent log
    const logData5 = {location:'clickbank.ts:64',message:'fetch error caught',data:{errorMessage:err instanceof Error?err.message:String(err),errorName:err instanceof Error?err.name:'Unknown',hasFallback:!!fallbackUrl,fallbackUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
    console.log('[DEBUG]', logData5);
    fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData5)}).catch(()=>{});
    // #endregion
    // Provide helpful error message if proxy server isn't available
    if (url.includes('/api/') && err instanceof TypeError && err.message.includes('Failed to fetch')) {
      const helpfulError = new Error(
        'Proxy server not available!\n\n' +
        'QUICK FIX OPTIONS:\n' +
        'Option 1 - Start local server:\n' +
        '  - Open PowerShell in root directory\n' +
        '  - Run: .\\start-api-server.ps1\n' +
        '  - Keep that window open\n\n' +
        'Option 2 - Utiliser le backend Vercel (aucun serveur local nécessaire):\n' +
        '  - Vérifie que le backend est accessible: https://affiliate-rhonat-delta.vercel.app/\n' +
        '  - Redémarre le serveur frontend si nécessaire\n\n' +
        'Voir QUICK-FIX.md pour plus de détails.'
      );
      helpfulError.name = 'ProxyServerError';
      throw helpfulError;
    }
    throw err;
  }
}

function normalizeOrdersPayload(payload: any): Order[] {
  if (!payload) return [];
  // Payload already an array
  if (Array.isArray(payload)) return payload as Order[];
  // Common shapes: { orders: [...] } or { orderData: { orders: [...] } }
  if (Array.isArray(payload.orders)) return payload.orders;
  if (Array.isArray(payload.orderData?.orders)) return payload.orderData.orders;
  if (Array.isArray(payload.data?.orders)) return payload.data.orders;
  // Fallback: wrap single object
  if (typeof payload === 'object') return [payload as Order];
  return [];
}

function normalizeAnalyticsPayload(payload: any): ClickData[] {
  if (!payload) return [];
  
  // Handle the format from working example: {"rows":{"row":[...]}}
  let rows: any[] = [];
  
  if (payload.rows?.row) {
    // Format: {"rows":{"row":[...]}} - from vendor dimension
    rows = Array.isArray(payload.rows.row) ? payload.rows.row : (payload.rows.row ? [payload.rows.row] : []);
  } else if (Array.isArray(payload)) {
    rows = payload;
  } else if (Array.isArray(payload.data)) {
    rows = payload.data;
  } else if (Array.isArray(payload.analytics)) {
    rows = payload.analytics;
  } else if (Array.isArray(payload.analytics?.data)) {
    rows = payload.analytics.data;
  } else if (Array.isArray(payload.rows)) {
    rows = payload.rows;
  }

  // Harmoniser les champs (trackingId / hops)
  return rows.map((row: any) => {
    // Handle vendor dimension format: {"dimensionValue":"mitolyn","data":[...]}
    const dimensionValue = row.dimensionValue || row.trackingId || row.tracking_id || row.tid || row.tracking || '';
    const dataArray = row.data || [];
    
    // Extract metrics from data array format: [{"attribute":"HOP_COUNT","value":{"$":"5"}}]
    const metrics: any = {};
    if (Array.isArray(dataArray)) {
      dataArray.forEach((item: any) => {
        if (item.attribute && item.value) {
          const value = typeof item.value === 'object' && item.value.$ !== undefined 
            ? item.value.$ 
            : item.value;
          metrics[item.attribute.toLowerCase()] = Number(value) || 0;
        }
      });
    }
    
    return {
      trackingId: dimensionValue,
      vendor: row.dimensionValue || dimensionValue, // For vendor dimension
      hops: Number(metrics.hop_count ?? row.hops ?? row.clicks ?? row.hopCount ?? 0),
      sales: Number(metrics.sale_count ?? row.sales ?? row.saleCount ?? 0),
      refunds: Number(row.refunds ?? row.refundCount ?? 0),
      chargebacks: Number(row.chargebacks ?? row.chargebackCount ?? 0),
      earnings: Number(row.earnings ?? row.amount ?? row.revenue ?? 0),
      ...row,
      ...metrics,
    };
  });
}

async function parseJsonResponse(response: Response) {
  const rawText = await response.text();
  if (!rawText) return { data: null, rawText: '' };

  try {
    return { data: JSON.parse(rawText), rawText };
  } catch (error) {
    console.warn('Non-JSON response received from ClickBank API:', rawText);
    return { data: null, rawText };
  }
}

export interface ClickBankConfig {
  apiKey: string;
  developerKey?: string;
}

export interface OrderFilters {
  startDate?: string; // Format: yyyy-mm-dd
  endDate?: string; // Format: yyyy-mm-dd
  affiliate?: string; // Pseudonyme de l'affilié
  vendor?: string; // Nickname du vendeur
  role?: string; // VENDOR ou AFFILIATE
  type?: string; // Type de transaction (SALE, RFND, CGBK, etc.)
  tid?: string; // Tracking ID ou Code Promo
  page?: number; // Numéro de page pour la pagination (défaut: 1)
}

export interface Order {
  receipt: string;
  transactionTime: string;
  transactionType: string;
  vendor: string;
  vendorId: string;
  productTitle: string;
  productId: string;
  amount: number;
  account: string;
  currency: string;
  paymentType: string;
  paymentMethod: string;
  role: string;
  affiliate: string;
  trackingId?: string;
  [key: string]: any; // Pour les champs additionnels
}

export interface OrdersResponse {
  orders: Order[];
  totalCount?: number;
  page?: number;
  hasMore?: boolean;
}

export interface AnalyticsFilters {
  startDate?: string; // Format: yyyy-mm-dd
  endDate?: string; // Format: yyyy-mm-dd
  trackingId?: string; // Filtrer par Tracking ID spécifique
  account?: string; // Account/vendor nickname (ex: "freenzy")
  dimension?: 'vendor' | 'TRACKING_ID'; // Dimension: vendor or TRACKING_ID (default: TRACKING_ID)
  select?: string; // Comma-separated metrics (ex: "HOP_COUNT,SALE_COUNT")
  role?: 'AFFILIATE' | 'VENDOR'; // Role: AFFILIATE or VENDOR (default: AFFILIATE)
}

export interface ClickData {
  trackingId: string;
  vendor?: string; // Vendor nickname (for vendor dimension)
  hops: number; // Nombre de clics (HOP_COUNT)
  sales: number; // Nombre de ventes (SALE_COUNT)
  refunds: number;
  chargebacks: number;
  earnings: number;
  [key: string]: any; // Pour les champs additionnels (HOP_COUNT, SALE_COUNT, etc.)
}

export interface AnalyticsResponse {
  data: ClickData[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface CreateAffiliateLinkRequest {
  affiliateNickname: string;
  vendorNickname: string;
  trackingId: string;
}

export interface AffiliateLink {
  url: string;
  affiliateNickname: string;
  vendorNickname: string;
  trackingId: string;
  createdAt: string;
  status: 'created';
}

export interface CreateAffiliateLinkResponse {
  success: boolean;
  link: AffiliateLink;
  message?: string;
}

/**
 * Récupère les ventes depuis l'API ClickBank avec tous les détails disponibles
 * 
 * @param config Configuration avec la clé API
 * @param filters Filtres optionnels pour la recherche
 * @returns Liste des commandes avec détails complets
 */
export async function getOrders(
  config: ClickBankConfig,
  filters: OrderFilters = {}
): Promise<OrdersResponse> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'clickbank.ts:215',message:'getOrders entry',data:{hasApiKey:!!config.apiKey,filters,CLICKBANK_PROXY_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  let apiKey = config.apiKey || DEFAULT_DEV_KEY;
  // Strip "API-" prefix if present to avoid double prefix
  if (apiKey.startsWith('API-')) {
    apiKey = apiKey.substring(4);
  }
  const page = filters.page || 1;

  const proxyUrl = buildOrdersUrl(filters);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'clickbank.ts:220',message:'getOrders URLs built',data:{proxyUrl,usesVercelBackend:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  try {
    const response = await fetchWithFallback(proxyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `API-${apiKey}`,
        'Accept': 'application/json',
        // La pagination est gérée par le backend Vercel via les query params,
        // donc pas besoin d'envoyer l'entête propriétaire "Page" côté client.
      },
    }, null, undefined);

    const { data: payload, rawText } = await parseJsonResponse(response);
    if (!response.ok) {
      const errorText =
        typeof payload === 'string'
          ? payload
          : payload
          ? JSON.stringify(payload)
          : rawText || response.statusText;
      throw new Error(`ClickBank API Error (${response.status}): ${errorText}`);
    }

    const ordersArray = normalizeOrdersPayload(payload);
    const totalCount = (payload as any)?.totalCount || (payload as any)?.orderData?.totalCount;

    return {
      orders: ordersArray,
      page,
      totalCount,
      hasMore: response.status === 206 || ordersArray.length === 100,
    };
  } catch (error) {
    console.error('Error fetching orders from ClickBank:', error);
    throw error;
  }
}

/**
 * Récupère toutes les ventes en gérant automatiquement la pagination
 * 
 * @param config Configuration avec la clé API
 * @param filters Filtres optionnels pour la recherche
 * @returns Toutes les commandes (toutes pages)
 */
export async function getAllOrders(
  config: ClickBankConfig,
  filters: OrderFilters = {}
): Promise<Order[]> {
  const allOrders: Order[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await getOrders(config, { ...filters, page });
    allOrders.push(...response.orders);
    hasMore = response.hasMore || false;
    page++;

    // Limite de sécurité pour éviter les boucles infinies
    if (page > 1000) {
      console.warn('Pagination limit reached (1000 pages)');
      break;
    }
  }

  return allOrders;
}

/**
 * Récupère les statistiques de clics (Hops) pour les liens d'affiliation
 * 
 * @param config Configuration avec la clé API
 * @param filters Filtres optionnels (dates, trackingId)
 * @returns Statistiques de clics par Tracking ID
 */
export async function getClicksAnalytics(
  config: ClickBankConfig,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsResponse> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'clickbank.ts:391',message:'getClicksAnalytics entry',data:{hasApiKey:!!config.apiKey,filters,CLICKBANK_PROXY_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  let apiKey = config.apiKey || DEFAULT_DEV_KEY;
  // Strip "API-" prefix if present to avoid double prefix
  if (apiKey.startsWith('API-')) {
    apiKey = apiKey.substring(4);
  }

  const proxyUrl = buildAnalyticsUrl(filters);
  const role = filters.role || 'AFFILIATE';
  const dimension = filters.dimension || 'TRACKING_ID';
  const roleLower = role.toLowerCase();
  const dimensionLower = dimension.toLowerCase();
  const directUrl = `${CLICKBANK_API_BASE_URL}/1.3/analytics/${roleLower}/${dimensionLower}`;
  
  // Build fallback URL with query params
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'clickbank.ts:410',message:'getClicksAnalytics URLs built',data:{proxyUrl,role,dimension,usesVercelBackend:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  try {
    const response = await fetchWithFallback(proxyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `API-${apiKey}`,
        'Accept': 'application/json',
      },
    }, null, undefined);

    const { data: payload, rawText } = await parseJsonResponse(response);

    if (!response.ok) {
      const errorText =
        typeof payload === 'string'
          ? payload
          : payload
          ? JSON.stringify(payload)
          : rawText || response.statusText;
      throw new Error(`ClickBank API Error (${response.status}): ${errorText}`);
    }

    const clickDataArray = normalizeAnalyticsPayload(payload);

    return {
      data: clickDataArray,
      period: {
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
      },
    };
  } catch (error) {
    console.error('Error fetching clicks analytics from ClickBank:', error);
    throw error;
  }
}

/**
 * Crée un lien d'affiliation (HopLink) ClickBank
 * 
 * Note: ClickBank ne fournit pas d'API POST pour créer des HopLinks.
 * Cette fonction construit l'URL du lien selon le format standard ClickBank
 * et retourne les détails du lien créé en JSON.
 * 
 * @param config Configuration avec la clé API (optionnel pour cette opération)
 * @param request Paramètres pour créer le lien
 * @returns Détails du lien d'affiliation créé
 */
export async function createAffiliateLink(
  config: ClickBankConfig,
  request: CreateAffiliateLinkRequest
): Promise<CreateAffiliateLinkResponse> {
  const { affiliateNickname, vendorNickname, trackingId } = request;

  // Validation des paramètres
  if (!affiliateNickname || !vendorNickname || !trackingId) {
    throw new Error('affiliateNickname, vendorNickname, and trackingId are required');
  }

  // Construction de l'URL du HopLink selon le format ClickBank
  // Format: https://[NICKNAME_AFFILIATE].vendornickname.hop.clickbank.net/?tid=[TRACKING_ID]
  const hopLinkUrl = `https://${affiliateNickname}.${vendorNickname}.hop.clickbank.net/?tid=${encodeURIComponent(trackingId)}`;

  const link: AffiliateLink = {
    url: hopLinkUrl,
    affiliateNickname,
    vendorNickname,
    trackingId,
    createdAt: new Date().toISOString(),
    status: 'created',
  };

  // Retourne une réponse JSON avec les détails du lien créé
  return {
    success: true,
    link,
    message: 'Affiliate link created successfully',
  };
}

export type ClickBankConnectionResult = {
  ok: boolean;
  payload?: OrdersResponse;
  error?: string;
};

/**
 * Teste la connexion à l'API ClickBank et retourne le payload JSON (ou l'erreur) pour affichage.
 */
export async function testConnection(config: ClickBankConfig): Promise<ClickBankConnectionResult> {
  try {
    const response = await getOrders(config, { page: 1 });
    return { ok: true, payload: response };
  } catch (error: any) {
    console.error('ClickBank connection test failed:', error);
    return { ok: false, error: error?.message || String(error) };
  }
}
