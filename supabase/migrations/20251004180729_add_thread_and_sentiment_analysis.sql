/*
  # Thread Detection and Sentiment Analysis

  1. Changes to tweets table
    - `is_thread` (boolean) - Whether this tweet is part of a thread
    - `thread_id` (text) - Unique identifier for the thread group
    - `thread_position` (integer) - Position in the thread (1, 2, 3, etc.)
    - `reply_to_tweet_id` (text) - Twitter ID of the tweet this is replying to
    - `sentiment` (text) - Sentiment analysis result: 'positive', 'negative', 'neutral'
    - `sentiment_score` (numeric) - Confidence score for sentiment (0-1)
    - `sentiment_analyzed_at` (timestamptz) - When sentiment was analyzed

  2. Indexes
    - Add index on thread_id for efficient thread grouping
    - Add index on sentiment for filtering
*/

-- Add thread detection columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'is_thread'
  ) THEN
    ALTER TABLE tweets ADD COLUMN is_thread boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'thread_id'
  ) THEN
    ALTER TABLE tweets ADD COLUMN thread_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'thread_position'
  ) THEN
    ALTER TABLE tweets ADD COLUMN thread_position integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'reply_to_tweet_id'
  ) THEN
    ALTER TABLE tweets ADD COLUMN reply_to_tweet_id text;
  END IF;
END $$;

-- Add sentiment analysis columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'sentiment'
  ) THEN
    ALTER TABLE tweets ADD COLUMN sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'sentiment_score'
  ) THEN
    ALTER TABLE tweets ADD COLUMN sentiment_score numeric(3,2) CHECK (sentiment_score >= 0 AND sentiment_score <= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'sentiment_analyzed_at'
  ) THEN
    ALTER TABLE tweets ADD COLUMN sentiment_analyzed_at timestamptz;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tweets_thread_id ON tweets(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tweets_is_thread ON tweets(is_thread) WHERE is_thread = true;
CREATE INDEX IF NOT EXISTS idx_tweets_sentiment ON tweets(sentiment);
CREATE INDEX IF NOT EXISTS idx_tweets_reply_to ON tweets(reply_to_tweet_id) WHERE reply_to_tweet_id IS NOT NULL;