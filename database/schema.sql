-- Create the confessions table
CREATE TABLE confessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  recipient_lower VARCHAR(255) NOT NULL,
  movie_id INTEGER NOT NULL,
  movie_title VARCHAR(500) NOT NULL,
  movie_poster_path VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_confessions_recipient_lower ON confessions(recipient_lower);
CREATE INDEX idx_confessions_movie_title ON confessions(movie_title);
CREATE INDEX idx_confessions_created_at ON confessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read confessions
CREATE POLICY "Anyone can read confessions" ON confessions
  FOR SELECT USING (true);

-- Allow anyone to create confessions
CREATE POLICY "Anyone can create confessions" ON confessions
  FOR INSERT WITH CHECK (true);