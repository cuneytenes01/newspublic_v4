/*
  # Add Media Fields to Tweets Table

  1. Changes
    - Add `media_type` (text) - Type of media (photo, video, animated_gif, none)
    - Add `media_url` (text) - URL to media file (image or video)
    - Add `media_thumbnail_url` (text) - Thumbnail URL for videos
    - Add `view_count` (integer) - Number of views (if available)

  2. Notes
    - These fields will store media information from Twitter API
    - All fields are nullable since not all tweets have media
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE tweets ADD COLUMN media_type text DEFAULT 'none';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'media_url'
  ) THEN
    ALTER TABLE tweets ADD COLUMN media_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'media_thumbnail_url'
  ) THEN
    ALTER TABLE tweets ADD COLUMN media_thumbnail_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tweets' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE tweets ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;