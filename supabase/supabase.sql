-- SQL schema for Supabase
CREATE TABLE IF NOT EXISTS steps (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "steps_select" ON steps FOR SELECT USING (true);
CREATE POLICY "steps_insert" ON steps FOR INSERT WITH CHECK (true);
