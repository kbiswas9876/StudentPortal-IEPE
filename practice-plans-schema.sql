-- Practice Plans Feature - Database Schema
-- Creates the practice_plans table for storing user-created study plans

CREATE TABLE IF NOT EXISTS public.practice_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('daily', 'weekly', 'monthly')),
  content JSONB NOT NULL, -- Stores structured plan: [{day: 1, config: [...]}, {day: 2, config: [...]}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_practice_plans_user_id ON public.practice_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_plans_plan_type ON public.practice_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_practice_plans_created_at ON public.practice_plans(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.practice_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own plans
CREATE POLICY "Users can view their own plans" ON public.practice_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own plans
CREATE POLICY "Users can insert their own plans" ON public.practice_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own plans
CREATE POLICY "Users can update their own plans" ON public.practice_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own plans
CREATE POLICY "Users can delete their own plans" ON public.practice_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_practice_plans_updated_at 
  BEFORE UPDATE ON public.practice_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
