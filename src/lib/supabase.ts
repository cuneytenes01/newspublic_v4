import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TwitterUser {
  id: string;
  username: string;
  display_name: string;
  profile_image_url: string;
  added_by: string;
  created_at: string;
  last_fetched_at: string | null;
}

export interface Tweet {
  id: string;
  tweet_id: string;
  twitter_user_id: string;
  content: string;
  content_tr: string | null;
  summary: string | null;
  created_at: string;
  fetched_at: string;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  view_count: number;
  media_type: string;
  media_url: string | null;
  media_thumbnail_url: string | null;
  media_urls: string[] | null;
  media_types: string[] | null;
  is_thread: boolean;
  thread_id: string | null;
  thread_position: number;
  reply_to_tweet_id: string | null;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  sentiment_score: number | null;
  sentiment_analyzed_at: string | null;
  twitter_users?: TwitterUser;
}

export interface UserTag {
  id: string;
  name: string;
  color: string;
  created_by: string;
  created_at: string;
  description: string;
}

export interface TwitterUserTag {
  id: string;
  twitter_user_id: string;
  tag_id: string;
  assigned_at: string;
  user_tags?: UserTag;
}

export interface SavedTweet {
  id: string;
  user_id: string;
  tweet_id: string;
  category: string;
  notes: string;
  saved_at: string;
  is_read_later: boolean;
  tweets?: Tweet;
}

export interface SavedTweetTag {
  id: string;
  saved_tweet_id: string;
  tag_name: string;
  created_at: string;
}
