/*
  # Add Multiple Media Support

  1. Changes
    - Add `media_urls` array column to store multiple image/video URLs
    - Add `media_types` array column to store types for each media item
    - Keep existing single media columns for backward compatibility
  
  2. Notes
    - Existing tweets with single media will continue to work
    - New tweets can have multiple media items (up to 4, as per Twitter)
    - The UI will display media in a responsive grid layout
*/

-- Add array columns for multiple media support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tweets' AND column_name = 'media_urls'
  ) THEN
    ALTER TABLE tweets ADD COLUMN media_urls text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tweets' AND column_name = 'media_types'
  ) THEN
    ALTER TABLE tweets ADD COLUMN media_types text[];
  END IF;
END $$;