-- Create table for saved practice sessions
CREATE TABLE saved_practice_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name TEXT NOT NULL,
    session_state JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_saved_practice_sessions_user_id ON saved_practice_sessions(user_id);
CREATE INDEX idx_saved_practice_sessions_created_at ON saved_practice_sessions(created_at);

-- Enable Row Level Security
ALTER TABLE saved_practice_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved sessions" ON saved_practice_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved sessions" ON saved_practice_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved sessions" ON saved_practice_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved sessions" ON saved_practice_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_saved_practice_sessions_updated_at 
    BEFORE UPDATE ON saved_practice_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
