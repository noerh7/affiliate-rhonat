
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: link, error } = await supabase
    .from("affiliate_links")
    .select("id, product_id")
    .eq("code", code)
    .single();

  if (error || !link) {
    return new Response("Invalid affiliate link", { status: 404 });
  }

  await supabase.from("clicks").insert({
    link_id: link.id,
    ip: req.headers.get("x-forwarded-for") ?? "unknown",
    user_agent: req.headers.get("user-agent") ?? "unknown",
  });

  const { data: product } = await supabase
    .from("products")
    .select("landing_url")
    .eq("id", link.product_id)
    .single();

  // Créer un cookie avec le link_id pour le tracking des ventes
  // Le cookie est valide pendant 30 jours
  const cookieMaxAge = 30 * 24 * 60 * 60; // 30 jours en secondes

  return new Response(null, {
    status: 302,
    headers: {
      "Location": product.landing_url,
      "Set-Cookie": `aff_link_id=${link.id}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax`,
    },
  });
});
