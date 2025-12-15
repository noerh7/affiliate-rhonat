import { supabase } from './supabase';

// Récupère les produits soit via la vue product_gravity, sinon fallback sur products+brands.
export async function getMarketplaceProducts() {
  // Essai vue product_gravity
  const view = await supabase
    .from('product_gravity')
    .select('*')
    .order('gravity_score', { ascending: false });

  if (!view.error && view.data && view.data.length > 0) {
    return view;
  }

  // Fallback : products + brands (si la vue est vide ou absente)
  const fallback = await supabase
    .from('products')
    .select('id, name, price, commission_percent, brands ( name )')
    .order('created_at', { ascending: false });

  if (fallback.error) return { data: null, error: fallback.error };

  const mapped =
    fallback.data?.map((p: any) => ({
      product_id: p.id,
      name: p.name,
      price: p.price,
      commission_percent: p.commission_percent,
      brand_name: p.brands?.name ?? 'Marque',
      gravity_score: 0,
    })) ?? [];

  return { data: mapped, error: null };
}

export async function getProductDetails(id: string) {
  // Récupération détaillée (produit + marque + liens existants)
  const [productRes, gravityRes] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        commission_percent,
        brand_id,
        landing_url,
        created_at,
        brands:brands (
          id,
          name,
          domain
        ),
        affiliate_links (
          id,
          code,
          affiliate_id,
          created_at,
          affiliates (
            display_name
          )
        )
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('product_gravity')
      .select('product_id, gravity_score, sales_30d, clicks_30d')
      .eq('product_id', id)
      .single(),
  ]);

  if (productRes.error) return { data: null, error: productRes.error };

  const p = productRes.data as any;
  const metrics = (!gravityRes.error && gravityRes.data) || {
    gravity_score: 0,
    sales_30d: 0,
    clicks_30d: 0,
  };

  const affiliateLinks =
    p.affiliate_links?.map((l: any) => ({
      id: l.id,
      code: l.code,
      affiliate_id: l.affiliate_id,
      affiliate_name: l.affiliates?.display_name ?? 'Affilié',
      created_at: l.created_at,
    })) ?? [];

  return {
    data: {
      id: p.id,
      name: p.name,
      price: p.price,
      commission_percent: p.commission_percent,
      landing_url: p.landing_url,
      created_at: p.created_at,
      brand_id: p.brand_id,
      brand: {
        id: p.brands?.id,
        name: p.brands?.name ?? 'Marque',
        domain: p.brands?.domain,
      },
      affiliate_links: affiliateLinks,
      gravity_score: metrics.gravity_score ?? 0,
      sales_30d: metrics.sales_30d ?? 0,
      clicks_30d: metrics.clicks_30d ?? 0,
    },
    error: null,
  };
}

