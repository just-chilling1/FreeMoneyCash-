-- Free Money Cash Database Schema
-- Create all tables with proper relationships and RLS policies

-- Users table (extends auth.users with profile data)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  upgrade_level TEXT DEFAULT 'free' CHECK (upgrade_level IN ('free', 'dfy_vault', 'instant_income', 'automated_income')),
  pages_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Niches table
CREATE TABLE IF NOT EXISTS public.niches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_id UUID NOT NULL REFERENCES public.niches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  commission_rate TEXT NOT NULL,
  affiliate_network TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table (user-generated affiliate pages)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  niche_id UUID NOT NULL REFERENCES public.niches(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  affiliate_link TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table (training content)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  category TEXT NOT NULL,
  upgrade_required TEXT DEFAULT 'free' CHECK (upgrade_required IN ('free', 'dfy_vault', 'instant_income', 'automated_income')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  earnings TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for niches table (public read)
CREATE POLICY "Anyone can view niches" ON public.niches
  FOR SELECT USING (true);

-- RLS Policies for offers table (public read)
CREATE POLICY "Anyone can view offers" ON public.offers
  FOR SELECT USING (true);

-- RLS Policies for pages table
CREATE POLICY "Users can view their own pages" ON public.pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pages" ON public.pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages" ON public.pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages" ON public.pages
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for videos table (public read)
CREATE POLICY "Anyone can view videos" ON public.videos
  FOR SELECT USING (true);

-- RLS Policies for testimonials table (public read)
CREATE POLICY "Anyone can view testimonials" ON public.testimonials
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offers_niche_id ON public.offers(niche_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON public.pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON public.pages(created_at DESC);
