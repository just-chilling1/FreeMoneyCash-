-- Training progress: which academy videos a user has marked complete.
-- video_id matches Vimeo IDs in lib/training-videos.ts (ACADEMY_TRAINING_VIDEOS).

CREATE TABLE IF NOT EXISTS public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, video_id)
);

ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training progress"
  ON public.training_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training progress"
  ON public.training_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training progress"
  ON public.training_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_training_progress_user_id
  ON public.training_progress(user_id);
