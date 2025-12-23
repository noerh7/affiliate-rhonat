
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Fonction helper pour extraire le link_id du cookie
  const getCookieValue = (cookieHeader: string | null, name: string): string | null => {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1].trim() : null;
  };

  let link_id: string | null = null;
  let amount: number;
  let order_id: string;

  // Support pour les requêtes GET (pixel) et POST (API)
  if (req.method === "GET") {
    // Mode pixel : lire les paramètres depuis l'URL et le cookie
    const url = new URL(req.url);
    order_id = url.searchParams.get("order_id") || "";
    const amountStr = url.searchParams.get("amount");
    amount = amountStr ? parseFloat(amountStr) : 0;

    // Lire le link_id depuis le cookie
    const cookieHeader = req.headers.get("cookie");
    link_id = getCookieValue(cookieHeader, "aff_link_id");

    if (!link_id) {
      return new Response("No affiliate link found in cookie", { status: 400 });
    }
  } else {
    // Mode API : lire depuis le body
    const body = await req.json();
    link_id = body.link_id;
    amount = body.amount;
    order_id = body.order_id;

    // Si link_id n'est pas fourni dans le body, essayer de le lire depuis le cookie
    if (!link_id) {
      const cookieHeader = req.headers.get("cookie");
      link_id = getCookieValue(cookieHeader, "aff_link_id");
    }

    if (!link_id) {
      return new Response("Missing link_id in body or cookie", { status: 400 });
    }
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: link } = await supabase
    .from("affiliate_links")
    .select("product_id")
    .eq("id", link_id)
    .single();

  if (!link) {
    return new Response("Invalid link", { status: 400 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("commission_percent")
    .eq("id", link.product_id)
    .single();

  const commission = (amount * product.commission_percent) / 100;

  await supabase.from("sales").insert({
    link_id,
    order_id,
    amount,
    commission,
  });

  // Pour les requêtes GET (pixel), retourner une image 1x1 transparente
  if (req.method === "GET") {
    // Image GIF 1x1 transparente
    const transparentGif = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));
    return new Response(transparentGif, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
