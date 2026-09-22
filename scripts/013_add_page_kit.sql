-- Add kit JSONB column to pages for Done-For-You Profit kits.
-- Stores authority article + Facebook posts alongside the hosted profit page.
-- Run in the shared Supabase project (SQL Editor). Safe to run multiple times.

ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS kit jsonb;

COMMENT ON COLUMN public.pages.kit IS
  'Optional DFY Profit kit payload (source, article, posts, usedKeys). NULL for normal builder pages.';

-- Reject non-object values when kit is present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pages_kit_is_object_or_null'
  ) THEN
    ALTER TABLE public.pages
      ADD CONSTRAINT pages_kit_is_object_or_null
      CHECK (kit IS NULL OR jsonb_typeof(kit) = 'object');
  END IF;
END $$;
