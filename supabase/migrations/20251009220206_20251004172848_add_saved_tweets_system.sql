/*
  # Saved Tweets Management System

  1. New Tables
    - `saved_tweets`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid) - User who saved the tweet
      - `tweet_id` (uuid) - Reference to tweets table
      - `category` (text) - Custom category/collection name
      - `notes` (text) - Personal notes or annotations
      - `saved_at` (timestamptz) - When the tweet was saved
      - `is_read_later` (boolean) - Flag for "Read Later" queue
      - Unique constraint on (user_id, tweet_id)

    - `saved_tweet_tags`
      - `id` (uuid, primary key) - Unique identifier
      - `saved_tweet_id` (uuid) - Reference to saved_tweets
      - `tag_name` (text) - Custom tag for organizing saved tweets
      - `created_at` (timestamptz) - When the tag was added

  2. Security
    - Enable RLS on all tables
    - saved_tweets: Users can only manage their own saved tweets
    - saved_tweet_tags: Users can only manage tags on their saved tweets

  3. Indexes
    - Add indexes for efficient filtering and search
*/

-- Create saved_tweets table
CREATE TABLE IF NOT EXISTS saved_tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tweet_id uuid REFERENCES tweets(id) ON DELETE CASCADE NOT NULL,
  category text DEFAULT 'Uncategorized',
  notes text DEFAULT '',
  saved_at timestamptz DEFAULT now(),
  is_read_later boolean DEFAULT false,
  UNIQUE(user_id, tweet_id)
);

ALTER TABLE saved_tweets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved tweets"
  ON saved_tweets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save tweets"
  ON saved_tweets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved tweets"
  ON saved_tweets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved tweets"
  ON saved_tweets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create saved_tweet_tags table for additional organization
CREATE TABLE IF NOT EXISTS saved_tweet_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_tweet_id uuid REFERENCES saved_tweets(id) ON DELETE CASCADE NOT NULL,
  tag_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_tweet_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tags on own saved tweets"
  ON saved_tweet_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM saved_tweets
      WHERE saved_tweets.id = saved_tweet_tags.saved_tweet_id
      AND saved_tweets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tags to own saved tweets"
  ON saved_tweet_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_tweets
      WHERE saved_tweets.id = saved_tweet_tags.saved_tweet_id
      AND saved_tweets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags from own saved tweets"
  ON saved_tweet_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM saved_tweets
      WHERE saved_tweets.id = saved_tweet_tags.saved_tweet_id
      AND saved_tweets.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_tweets_user_id ON saved_tweets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tweets_tweet_id ON saved_tweets(tweet_id);
CREATE INDEX IF NOT EXISTS idx_saved_tweets_category ON saved_tweets(category);
CREATE INDEX IF NOT EXISTS idx_saved_tweets_saved_at ON saved_tweets(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_tweets_is_read_later ON saved_tweets(is_read_later) WHERE is_read_later = true;
CREATE INDEX IF NOT EXISTS idx_saved_tweet_tags_saved_tweet_id ON saved_tweet_tags(saved_tweet_id);