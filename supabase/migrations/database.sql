-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.affiliate_approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_id uuid,
  product_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT affiliate_approvals_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_approvals_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id),
  CONSTRAINT affiliate_approvals_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.affiliate_balances (
  affiliate_id uuid NOT NULL,
  balance numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT affiliate_balances_pkey PRIMARY KEY (affiliate_id),
  CONSTRAINT affiliate_balances_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id)
);
CREATE TABLE public.affiliate_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_id uuid,
  product_id uuid,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT affiliate_links_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_links_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id),
  CONSTRAINT affiliate_links_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.affiliate_payout_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_id uuid,
  type text CHECK (type = ANY (ARRAY['paypal'::text, 'bank'::text, 'stripe_connect'::text])),
  account text NOT NULL,
  stripe_account_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT affiliate_payout_methods_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_payout_methods_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id)
);
CREATE TABLE public.affiliate_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_id uuid,
  amount numeric NOT NULL,
  method text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text])),
  reference text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT affiliate_payouts_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_payouts_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id)
);
CREATE TABLE public.affiliates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  display_name text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT affiliates_pkey PRIMARY KEY (id),
  CONSTRAINT affiliates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.brands (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clicks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  link_id uuid,
  ip text,
  user_agent text,
  referer text,
  accept_language text,
  accept_encoding text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clicks_pkey PRIMARY KEY (id),
  CONSTRAINT clicks_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.affiliate_links(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  brand_id uuid,
  name text NOT NULL,
  price numeric NOT NULL,
  commission_percent numeric DEFAULT 30,
  landing_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);
CREATE TABLE public.sales (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  link_id uuid,
  order_id text,
  amount numeric,
  commission numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sales_pkey PRIMARY KEY (id),
  CONSTRAINT sales_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.affiliate_links(id)
);