// Serverless redirector for affiliate links.
// Requires env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role).

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const HEADERS = SUPABASE_SERVICE_ROLE_KEY
  ? {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }
  : null;

async function fetchSingle(url) {
  const resp = await fetch(url, { headers: HEADERS });
  const json = await resp.json();
  if (!resp.ok || !json?.length) return null;
  return json[0];
}

function ensureAbsoluteUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default async function handler(req, res) {
  try {
    // Vérifier les variables d'environnement
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !HEADERS) {
      console.error('Missing environment variables:', {
        hasSupabaseUrl: !!SUPABASE_URL,
        hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
      });
      return res.status(500).json({
        error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.',
        details: 'Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.',
      });
    }

  // Extraire le code depuis l'URL ou les query params
  // Sur Vercel, avec [code].js, le paramètre peut être dans req.query ou dans l'URL
  let code = req.query?.code;
  
  // Si code n'est pas dans query, essayer de l'extraire de l'URL
  if (!code) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/');
    const goIndex = pathParts.indexOf('go');
    if (goIndex !== -1 && pathParts[goIndex + 1]) {
      code = pathParts[goIndex + 1];
    }
  }

  // Normaliser le code
  if (Array.isArray(code)) {
    code = code[0];
  }

  if (!code || typeof code !== 'string' || code.trim() === '') {
    console.error('Invalid code:', code, 'URL:', req.url);
    return res.status(400).json({ error: 'Invalid affiliate code.' });
  }

  code = code.trim();

  const link = await fetchSingle(
    `${SUPABASE_URL}/rest/v1/affiliate_links?select=id,product_id&code=eq.${encodeURIComponent(
      code
    )}&limit=1`
  );

  if (!link) {
    return res.status(404).json({ error: 'Affiliate link not found.' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const referer = req.headers['referer'] || req.headers['referrer'] || null;
  const acceptLanguage = req.headers['accept-language'] || null;
  const acceptEncoding = req.headers['accept-encoding'] || null;

  // Enregistrer le clic avec toutes les métadonnées pour le tracking et anti-fraude
  await fetch(`${SUPABASE_URL}/rest/v1/clicks`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      link_id: link.id,
      ip,
      user_agent: userAgent,
      referer,
      accept_language: acceptLanguage,
      accept_encoding: acceptEncoding,
    }),
  });

  const product = await fetchSingle(
    `${SUPABASE_URL}/rest/v1/products?select=landing_url&id=eq.${encodeURIComponent(
      link.product_id
    )}&limit=1`
  );

  if (!product || !product.landing_url) {
    console.error('Product not found for product_id:', link.product_id);
    return res.status(404).json({ error: 'Product not found.' });
  }

  const destination = ensureAbsoluteUrl(product.landing_url);
  
  if (!destination) {
    console.error('Invalid landing URL:', product.landing_url);
    return res.status(500).json({ error: 'Invalid product landing URL.' });
  }
  
  // Poser un cookie pour attribuer les ventes futures (durée: 30 jours comme les réseaux d'affiliation)
  // Le cookie contient le link_id pour l'attribution automatique
  const COOKIE_NAME = 'aff_link_id';
  const COOKIE_VALUE = link.id;
  const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 jours en secondes
  const cookie = `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
  
  // Si la destination contient déjà des paramètres, ajouter le link_id en paramètre aussi
  // pour permettre le tracking côté serveur si le cookie est bloqué
  const destinationUrl = new URL(destination);
  destinationUrl.searchParams.set('aff_link_id', link.id);
  const finalDestination = destinationUrl.toString();

    return res
      .setHeader('Set-Cookie', cookie)
      .redirect(302, finalDestination);
  } catch (error) {
    console.error('Error in affiliate link handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

