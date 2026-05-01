-- Run this in your Supabase SQL Editor

-- Create Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Enable RLS (Row Level Security) if using anon key
-- For a simple MVP without auth, we can just allow all operations
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow public access for MVP
CREATE POLICY "Allow public access for projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
