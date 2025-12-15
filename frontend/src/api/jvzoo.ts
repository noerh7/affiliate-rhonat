/**
 * Service API JVZoo
 * 
 * Ce service permet d'interagir avec l'API JVZoo pour :
 * - Tester la connexion
 * - Récupérer les offres disponibles
 * - Récupérer les ventes
 * - Créer des liens d'affiliation
 */

const envVars =
  typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

const JVZOO_API_BASE_URL = envVars.VITE_JVZOO_API_BASE_URL || 'https://api.jvzoo.com/v2.0';
const JVZOO_PROXY_FALLBACK_URL =
  envVars.VITE_JVZOO_PROXY_FALLBACK_URL || 'https://affiliate-rhonat.vercel.app/api/jvzoo/proxy';
const JVZOO_PROXY_URL =
  envVars.VITE_JVZOO_PROXY_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/api/jvzoo/proxy'
    : JVZOO_PROXY_FALLBACK_URL);
const DEFAULT_API_KEY = 'd5d993ae581978c19fa97a324b7daeb2fd67d00b353a71fcc7540c2d1a25f50b';

export type JVZooConfig = {
  apiKey: string;
  apiSecret?: string;
  affiliateId?: string; // UUID de l'influenceur
};

export type JVZooOffer = {
  id: string;
  name: string;
  vendor: string;
  price: string;
  currency: string;
  [key: string]: any;
};

export type JVZooLink = {
  url: string;
  affiliateId?: string;
  productId: string;
  trackingId?: string;
};

export type JVZooConnectionResult = {
  ok: boolean;
  payload?: Record<string, any>;
  error?: string;
};

function buildJVZooProxyFallback(target: string, extraQuery = ''): string | null {
  if (!JVZOO_PROXY_URL || JVZOO_PROXY_URL.startsWith('http')) return null;
  const suffix = extraQuery ? `&${extraQuery}` : '';
  return `${JVZOO_PROXY_FALLBACK_URL}?target=${target}${suffix}`;
}

async function fetchJVZooWithFallback(url: string, init: RequestInit, fallbackUrl: string | null) {
  const candidates = [url];
  if (fallbackUrl && fallbackUrl !== url) {
    candidates.push(fallbackUrl);
  }

  let lastError: any = null;

  for (const targetUrl of candidates) {
    try {
      const res = await fetch(targetUrl, init);
      if (
        !res.ok &&
        (res.status === 500 || res.status === 502 || res.status === 503) &&
        targetUrl !== candidates[candidates.length - 1]
      ) {
        lastError = new Error(`Upstream error ${res.status} on ${targetUrl}`);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (targetUrl !== candidates[candidates.length - 1]) {
        continue;
      }
      throw err;
    }
  }

  if (lastError) throw lastError;
  throw new Error('Unknown JVZoo fetch failure');
}

/**
 * Teste la connexion à l'API JVZoo
 * JVZoo utilise Basic Auth: apiKey comme username, "x" comme password
 */
export async function testJVZooConnection(config: JVZooConfig): Promise<JVZooConnectionResult> {
  if (!config.apiKey) {
    return { ok: false, error: 'Missing JVZoo API Key' };
  }

  const apiKey = config.apiKey || DEFAULT_API_KEY;
  const url = JVZOO_PROXY_URL ? `${JVZOO_PROXY_URL}?target=status` : `${JVZOO_API_BASE_URL}/affiliates/status`;
  const fallbackUrl = JVZOO_PROXY_URL && !JVZOO_PROXY_URL.startsWith('http')
    ? buildJVZooProxyFallback('status')
    : null;

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'x-jvzoo-key': apiKey,
    };

    const response = await fetchJVZooWithFallback(url, {
      method: 'GET',
      headers,
    }, fallbackUrl);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        error: `JVZoo API Error (${response.status}): ${errorText}`,
      };
    }

    const payload = await response.json();
    return {
      ok: true,
      payload,
    };
  } catch (error: any) {
    console.error('JVZoo connection test failed:', error);
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
}

/**
 * Récupère les offres disponibles depuis l'API JVZoo
 */
export async function getJVZooOffers(config: JVZooConfig): Promise<JVZooOffer[]> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jvzoo.ts:94',message:'getJVZooOffers entry',data:{hasApiKey:!!config.apiKey,JVZOO_PROXY_URL,JVZOO_API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (!config.apiKey) {
    throw new Error('Missing JVZoo API Key');
  }

  const apiKey = config.apiKey || DEFAULT_API_KEY;
  const url = JVZOO_PROXY_URL ? `${JVZOO_PROXY_URL}?target=offers` : `${JVZOO_API_BASE_URL}/products`;
  const fallbackUrl = JVZOO_PROXY_URL && !JVZOO_PROXY_URL.startsWith('http')
    ? buildJVZooProxyFallback('offers')
    : null;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jvzoo.ts:100',message:'getJVZooOffers URL built',data:{url,usingProxy:!!JVZOO_PROXY_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'x-jvzoo-key': apiKey,
    };
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jvzoo.ts:108',message:'before JVZoo fetch',data:{url,headers:Object.keys(headers)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    const response = await fetchJVZooWithFallback(url, {
      method: 'GET',
      headers,
    }, fallbackUrl);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jvzoo.ts:112',message:'after JVZoo fetch',data:{status:response.status,ok:response.ok,statusText:response.statusText,url:response.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const errorText = await response.text();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a2f4ff67-11fb-447c-ab87-7f5519201c61',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jvzoo.ts:115',message:'JVZoo response not ok',data:{status:response.status,errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      throw new Error(`JVZoo API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Normaliser la réponse selon le format retourné par JVZoo
    if (Array.isArray(data)) {
      return data as JVZooOffer[];
    }
    if (Array.isArray(data.products)) {
      return data.products as JVZooOffer[];
    }
    if (Array.isArray(data.data)) {
      return data.data as JVZooOffer[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching JVZoo offers:', error);
    // Provide helpful error message if proxy server isn't available
    if (error instanceof TypeError && error.message.includes('Failed to fetch') && url.includes('/api/')) {
      const helpfulError = new Error(
        'JVZoo proxy server not available!\n\n' +
        'QUICK FIX:\n' +
        '1. Open PowerShell in root directory\n' +
        '2. Run: node server.js\n' +
        '3. Keep that window open\n' +
        '4. Test again\n\n' +
        'See START-SERVER.md for detailed instructions.'
      );
      helpfulError.name = 'ProxyServerError';
      throw helpfulError;
    }
    throw error;
  }
}

/**
 * Récupère les ventes depuis l'API JVZoo
 */
export async function getJVZooSales(
  config: JVZooConfig,
  filters: { startDate?: string; endDate?: string } = {}
): Promise<any[]> {
  if (!config.apiKey) {
    throw new Error('Missing JVZoo API Key');
  }

  const apiKey = config.apiKey || DEFAULT_API_KEY;
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  const url = JVZOO_PROXY_URL
    ? `${JVZOO_PROXY_URL}?target=sales${queryString ? `&${queryString}` : ''}`
    : `${JVZOO_API_BASE_URL}/sales${queryString ? `?${queryString}` : ''}`;
  const fallbackUrl =
    JVZOO_PROXY_URL && !JVZOO_PROXY_URL.startsWith('http')
      ? buildJVZooProxyFallback('sales', queryString)
      : null;

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'x-jvzoo-key': apiKey,
    };

    const response = await fetchJVZooWithFallback(url, {
      method: 'GET',
      headers,
    }, fallbackUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`JVZoo API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Normaliser la réponse
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data.sales)) {
      return data.sales;
    }
    if (Array.isArray(data.data)) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching JVZoo sales:', error);
    throw error;
  }
}

/**
 * Construit un lien d'affiliation JVZoo
 * Format: https://www.jvzoo.com/c/{affiliateId}/{productId}?tid={trackingId}
 */
export async function createJVZooAffiliateLink(
  config: JVZooConfig,
  productId: string,
  trackingId?: string
): Promise<JVZooLink> {
  if (!config.affiliateId) {
    throw new Error('affiliateId is required to create JVZoo affiliate link');
  }

  const affiliateId = config.affiliateId;
  const tid = trackingId ? `?tid=${encodeURIComponent(trackingId)}` : '';
  const url = `https://www.jvzoo.com/c/${affiliateId}/${productId}${tid}`;

  return {
    url,
    affiliateId,
    productId,
    trackingId,
  };
}
