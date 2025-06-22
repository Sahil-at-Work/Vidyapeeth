/*
  # Create News Table for News Section

  1. New Tables
    - `news`
      - `id` (uuid, primary key)
      - `title` (text, not null) - News article title
      - `description` (text, not null) - Short description/summary
      - `url` (text, not null) - External link to full article
      - `image_url` (text, nullable) - Optional image for the news card
      - `published_at` (timestamp, not null) - When the news was published
      - `is_active` (boolean, default true) - Whether to show this news
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `news` table
    - Public read access for all users
    - Admin-only write access (for future admin panel)

  3. Sample Data
    - Insert sample news articles for demonstration
*/

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  image_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create policies for news
CREATE POLICY "News are publicly readable"
  ON news
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage news"
  ON news
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_active ON news(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample news articles
INSERT INTO news (title, description, url, image_url, published_at) VALUES
  (
    'New Study Reveals Breakthrough in Quantum Computing',
    'Scientists have achieved a major milestone in quantum computing that could revolutionize technology and education.',
    'https://example.com/quantum-computing-breakthrough',
    'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    now() - interval '2 hours'
  ),
  (
    'AI-Powered Learning Platforms Show 40% Improvement',
    'Recent research indicates that students using AI-enhanced learning platforms perform significantly better.',
    'https://example.com/ai-learning-improvement',
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    now() - interval '6 hours'
  ),
  (
    'Global Education Summit 2025 Announces Key Initiatives',
    'World leaders gather to discuss the future of education and announce new collaborative programs.',
    'https://example.com/education-summit-2025',
    'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    now() - interval '1 day'
  ),
  (
    'Virtual Reality Transforms Science Education',
    'Schools worldwide are adopting VR technology to make complex scientific concepts more accessible to students.',
    'https://example.com/vr-science-education',
    'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    now() - interval '2 days'
  ),
  (
    'New Scholarship Program Supports STEM Students',
    'A major tech company announces a $50 million scholarship program for underrepresented students in STEM fields.',
    'https://example.com/stem-scholarship-program',
    'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    now() - interval '3 days'
  ),
  (
    'Online Learning Platforms See Record Enrollment',
    'Digital education platforms report unprecedented growth as students embrace flexible learning options.',
    'https://example.com/online-learning-growth',
    'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    now() - interval '4 days'
  ),
  (
    'Breakthrough in Renewable Energy Education',
    'Universities launch new programs focused on sustainable energy solutions and green technology.',
    'https://example.com/renewable-energy-education',
    'https://images.pexels.com/photos/9800029/pexels-photo-9800029.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    now() - interval '5 days'
  ),
  (
    'Mental Health Support in Education Gets Major Boost',
    'New initiatives focus on student wellbeing and mental health resources in educational institutions.',
    'https://example.com/mental-health-education',
    'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    now() - interval '6 days'
  )
ON CONFLICT DO NOTHING;