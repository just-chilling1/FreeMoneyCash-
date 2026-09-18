-- Track which High-Ticket authority articles a member marked as used per pasted affiliate URL.
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS public.high_ticket_article_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url_hash text NOT NULL,
  article_id integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT high_ticket_article_usage_url_hash_len CHECK (length(url_hash) = 64)
);

CREATE UNIQUE INDEX IF NOT EXISTS high_ticket_article_usage_url_uidx
  ON public.high_ticket_article_usage (user_id, url_hash, article_id);

CREATE INDEX IF NOT EXISTS high_ticket_article_usage_user_url_idx
  ON public.high_ticket_article_usage (user_id, url_hash);

ALTER TABLE public.high_ticket_article_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own high ticket article usage" ON public.high_ticket_article_usage;
CREATE POLICY "Users can view own high ticket article usage"
  ON public.high_ticket_article_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own high ticket article usage" ON public.high_ticket_article_usage;
CREATE POLICY "Users can insert own high ticket article usage"
  ON public.high_ticket_article_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own high ticket article usage" ON public.high_ticket_article_usage;
CREATE POLICY "Users can delete own high ticket article usage"
  ON public.high_ticket_article_usage FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON TABLE public.high_ticket_article_usage TO authenticated;
GRANT ALL ON TABLE public.high_ticket_article_usage TO service_role;
