-- Seed initial data for Free Money Cash

-- Insert niches
INSERT INTO public.niches (name, description, icon) VALUES
  ('Dating & Relationships', 'Guide people to better relationships and dating success', '❤️'),
  ('Health & Wellness', 'Promote products that improve overall health and wellbeing', '🌿'),
  ('Make Money Online', 'Share opportunities for earning income from home', '💰'),
  ('Technology & Gadgets', 'Review the latest tech products and innovations', '📱'),
  ('Fitness & Sports', 'Help people crush fitness goals with training, sports, and performance products', '🏋️'),
  ('Self-Help & Personal Development', 'Help people grow mindset, habits, and achieve their full potential', '🧠'),
  ('Finance & Investing', 'Guide people toward smarter money, wealth, and investing decisions', '📈'),
  ('Digital Marketing', 'Promote tools and strategies that grow traffic, leads, and sales', '📢'),
  ('Beauty & Skincare', 'Share beauty and skincare products that help people look and feel their best', '✨'),
  ('Education & Learning', 'Help people learn new skills with courses, training, and study tools', '📚'),
  ('Business & Entrepreneurship', 'Support founders with tools and systems to start and scale businesses', '💼'),
  ('Travel & Lifestyle', 'Inspire better travel and lifestyle choices with products people love', '✈️')
ON CONFLICT DO NOTHING;

-- Insert sample offers (using niche IDs)
INSERT INTO public.offers (niche_id, title, description, commission_rate, affiliate_network)
SELECT 
  n.id,
  'Ultimate Fitness Performance System',
  'Proven 12-week program that helps people build strength and hit fitness goals',
  '50% per sale ($47 product)',
  'DigiStore24'
FROM public.niches n WHERE n.name = 'Fitness & Sports'
ON CONFLICT DO NOTHING;

INSERT INTO public.offers (niche_id, title, description, commission_rate, affiliate_network)
SELECT 
  n.id,
  'Affiliate Marketing Masterclass',
  'Complete training on building a profitable affiliate business',
  '40% per sale ($197 product)',
  'DigiStore24'
FROM public.niches n WHERE n.name = 'Make Money Online'
ON CONFLICT DO NOTHING;

INSERT INTO public.offers (niche_id, title, description, commission_rate, affiliate_network)
SELECT 
  n.id,
  'Text Chemistry Formula',
  'Texting secrets that make men obsess over you',
  '75% per sale ($67 product)',
  'DigiStore24'
FROM public.niches n WHERE n.name = 'Dating & Relationships'
ON CONFLICT DO NOTHING;

-- Insert training videos
INSERT INTO public.training_videos (title, description, duration, thumbnail_url, video_url, category, required_upgrade) VALUES
  ('Getting Started with Free Money Cash', 'Learn the basics of creating your first profit page', '5:30', '/placeholder.svg?height=180&width=320', '#', 'Basics', 'free'),
  ('Choosing Profitable Niches', 'Discover which niches convert best for beginners', '8:15', '/placeholder.svg?height=180&width=320', '#', 'Strategy', 'free'),
  ('Sharing Your Pages Effectively', 'Master the art of getting traffic to your pages', '10:45', '/placeholder.svg?height=180&width=320', '#', 'Marketing', 'free')
ON CONFLICT DO NOTHING;
