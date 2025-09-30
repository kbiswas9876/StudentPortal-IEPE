-- Practice Plans Schema
-- This creates the practice_plans table for storing user-created study plans

CREATE TABLE IF NOT EXISTS public.practice_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('daily', 'weekly', 'monthly')),
  content JSONB NOT NULL, -- Will store the structured plan data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_practice_plans_user_id ON public.practice_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_plans_plan_type ON public.practice_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_practice_plans_created_at ON public.practice_plans(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.practice_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own practice plans" ON public.practice_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice plans" ON public.practice_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice plans" ON public.practice_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practice plans" ON public.practice_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_practice_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_practice_plans_updated_at
  BEFORE UPDATE ON public.practice_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_plans_updated_at();