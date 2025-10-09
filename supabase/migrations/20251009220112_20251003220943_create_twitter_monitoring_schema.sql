/*
  # Twitter Monitoring Platform Schema

  1. New Tables
    - `twitter_users`
      - `id` (uuid, primary key) - Unique identifier
      - `username` (text, unique) - Twitter username
      - `display_name` (text) - Display name of the Twitter user
      - `profile_image_url` (text) - Profile image URL
      - `added_by` (uuid) - User who added this Twitter account
      - `created_at` (timestamptz) - When the Twitter user was added
      - `last_fetched_at` (timestamptz) - Last time tweets were fetched
    
    - `tweets`
      - `id` (uuid, primary key) - Unique identifier
      - `tweet_id` (text, unique) - Twitter's tweet ID
      - `twitter_user_id` (uuid) - Reference to twitter_users
      - `content` (text) - Tweet content
      - `content_tr` (text) - Turkish translation (cached)
      - `summary` (text) - AI generated summary (cached)
      - `created_at` (timestamptz) - When tweet was posted on Twitter
      - `fetched_at` (timestamptz) - When we fetched this tweet
      - `like_count` (integer) - Number of likes
      - `retweet_count` (integer) - Number of retweets
      - `reply_count` (integer) - Number of replies
    
    - `user_subscriptions`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid) - Reference to auth.users
      - `subscription_type` (text) - Type of subscription (free, premium, etc.)
      - `expires_at` (timestamptz) - Subscription expiration date
      - `created_at` (timestamptz) - When subscription was created

  2. Security
    - Enable RLS on all tables
    - twitter_users: Authenticated users can read all, only insert their own
    - tweets: Authenticated users can read all
    - user_subscriptions: Users can only see their own subscription
*/

-- Create twitter_users table
CREATE TABLE IF NOT EXISTS twitter_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text DEFAULT '',
  profile_image_url text DEFAULT '',
  added_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_fetched_at timestamptz
);

ALTER TABLE twitter_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view twitter users"
  ON twitter_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add twitter accounts"
  ON twitter_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can update twitter accounts they added"
  ON twitter_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = added_by)
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can delete twitter accounts they added"
  ON twitter_users FOR DELETE
  TO authenticated
  USING (auth.uid() = added_by);

-- Create tweets table
CREATE TABLE IF NOT EXISTS tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id text UNIQUE NOT NULL,
  twitter_user_id uuid REFERENCES twitter_users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  content_tr text,
  summary text,
  created_at timestamptz DEFAULT now(),
  fetched_at timestamptz DEFAULT now(),
  like_count integer DEFAULT 0,
  retweet_count integer DEFAULT 0,
  reply_count integer DEFAULT 0
);

ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all tweets"
  ON tweets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert tweets"
  ON tweets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update tweets"
  ON tweets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_type text DEFAULT 'free',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tweets_twitter_user_id ON tweets(twitter_user_id);
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_users_username ON twitter_users(username);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);