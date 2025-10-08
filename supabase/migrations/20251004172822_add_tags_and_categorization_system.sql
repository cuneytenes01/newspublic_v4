/*
  # Tags and Categorization System

  1. New Tables
    - `user_tags`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text, unique per user) - Tag name (e.g., "AI", "SEO", "Tech")
      - `color` (text) - Hex color code for visual identification
      - `created_by` (uuid) - User who created this tag
      - `created_at` (timestamptz) - When the tag was created
      - `description` (text) - Optional description for the tag
    
    - `twitter_user_tags`
      - `id` (uuid, primary key) - Unique identifier
      - `twitter_user_id` (uuid) - Reference to twitter_users
      - `tag_id` (uuid) - Reference to user_tags
      - `assigned_at` (timestamptz) - When the tag was assigned
      - Unique constraint on (twitter_user_id, tag_id)

  2. Security
    - Enable RLS on all tables
    - user_tags: Users can only manage their own tags
    - twitter_user_tags: Users can only manage tags for their followed users

  3. Indexes
    - Add indexes for efficient tag filtering and lookups
*/

-- Create user_tags table
CREATE TABLE IF NOT EXISTS user_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  description text DEFAULT '',
  UNIQUE(created_by, name)
);

ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags"
  ON user_tags FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create own tags"
  ON user_tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own tags"
  ON user_tags FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own tags"
  ON user_tags FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create twitter_user_tags junction table
CREATE TABLE IF NOT EXISTS twitter_user_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_user_id uuid REFERENCES twitter_users(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES user_tags(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(twitter_user_id, tag_id)
);

ALTER TABLE twitter_user_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tags on their followed users"
  ON twitter_user_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM twitter_users
      WHERE twitter_users.id = twitter_user_tags.twitter_user_id
      AND twitter_users.added_by = auth.uid()
    )
  );

CREATE POLICY "Users can assign tags to their followed users"
  ON twitter_user_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM twitter_users
      WHERE twitter_users.id = twitter_user_tags.twitter_user_id
      AND twitter_users.added_by = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM user_tags
      WHERE user_tags.id = twitter_user_tags.tag_id
      AND user_tags.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can remove tags from their followed users"
  ON twitter_user_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM twitter_users
      WHERE twitter_users.id = twitter_user_tags.twitter_user_id
      AND twitter_users.added_by = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tags_created_by ON user_tags(created_by);
CREATE INDEX IF NOT EXISTS idx_twitter_user_tags_twitter_user_id ON twitter_user_tags(twitter_user_id);
CREATE INDEX IF NOT EXISTS idx_twitter_user_tags_tag_id ON twitter_user_tags(tag_id);

-- Insert some default tags for new users (optional)
-- Users can delete or modify these as needed