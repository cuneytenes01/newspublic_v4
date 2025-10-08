import { useState, useEffect } from 'react';
import { supabase, SavedTweet, Tweet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TweetCard from './TweetCard';
import { Bookmark, Loader2, AlertCircle, Filter, Search, Trash2, FolderOpen } from 'lucide-react';

interface SavedTweetsPageProps {
  onSummarize: (tweetId: string, content: string) => Promise<string>;
  onTranslate: (tweetId: string, content: string) => Promise<string>;
}

export default function SavedTweetsPage({ onSummarize, onTranslate }: SavedTweetsPageProps) {
  const { user } = useAuth();
  const [savedTweets, setSavedTweets] = useState<(SavedTweet & { tweets: Tweet })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadSavedTweets();
  }, [user]);

  const loadSavedTweets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_tweets')
        .select(`
          *,
          tweets (
            *,
            twitter_users (*)
          )
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      const tweetsData = data?.filter((item) => item.tweets) as (SavedTweet & { tweets: Tweet })[];
      setSavedTweets(tweetsData || []);

      const uniqueCategories = [...new Set(tweetsData?.map((st) => st.category) || [])];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error loading saved tweets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSaved = async (savedTweetId: string) => {
    if (!confirm('Are you sure you want to remove this tweet from saved?')) return;

    try {
      const { error } = await supabase
        .from('saved_tweets')
        .delete()
        .eq('id', savedTweetId);

      if (error) throw error;
      await loadSavedTweets();
    } catch (err) {
      console.error('Error deleting saved tweet:', err);
      alert('Failed to remove tweet');
    }
  };

  const handleCategoryChange = async (savedTweetId: string, newCategory: string) => {
    try {
      const { error } = await supabase
        .from('saved_tweets')
        .update({ category: newCategory })
        .eq('id', savedTweetId);

      if (error) throw error;
      await loadSavedTweets();
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Failed to update category');
    }
  };

  const filteredTweets = savedTweets.filter((st) => {
    const matchesCategory = selectedCategory === 'all' || st.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      st.tweets.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.tweets.twitter_users?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.notes.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl">
              <Bookmark className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Saved Tweets
              </h2>
              <p className="text-gray-600 font-medium mt-1">
                {savedTweets.length} tweet{savedTweets.length !== 1 ? 's' : ''} saved for later
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search saved tweets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-bold text-gray-700">Filter by Category</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    All ({savedTweets.length})
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {category} ({savedTweets.filter((st) => st.category === category).length})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
            <p className="text-gray-600 font-semibold">Loading saved tweets...</p>
          </div>
        ) : savedTweets.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4">
              <Bookmark className="w-12 h-12 text-amber-600" />
            </div>
            <p className="text-gray-700 text-xl font-bold mb-2">No saved tweets yet</p>
            <p className="text-gray-500 font-medium">
              Click the bookmark button on any tweet to save it for later
            </p>
          </div>
        ) : filteredTweets.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4">
              <AlertCircle className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-gray-700 text-xl font-bold mb-2">No tweets match your filters</p>
            <p className="text-gray-500 font-medium">
              Try adjusting your search or category filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTweets.map((savedTweet) => (
              <div key={savedTweet.id} className="relative">
                <div className="absolute -top-2 -right-2 z-10 flex gap-2">
                  <select
                    value={savedTweet.category}
                    onChange={(e) => handleCategoryChange(savedTweet.id, e.target.value)}
                    className="px-3 py-1.5 bg-white border-2 border-amber-300 rounded-lg text-xs font-bold text-gray-700 shadow-sm hover:border-amber-400 transition-colors"
                  >
                    <option value="Uncategorized">Uncategorized</option>
                    <option value="AI">AI</option>
                    <option value="Tech">Tech</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Read Later">Read Later</option>
                  </select>
                  <button
                    onClick={() => handleDeleteSaved(savedTweet.id)}
                    className="p-2 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors shadow-sm"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <TweetCard
                  tweet={savedTweet.tweets}
                  onSummarize={onSummarize}
                  onTranslate={onTranslate}
                  onBookmarkChange={loadSavedTweets}
                />
                {savedTweet.notes && (
                  <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs font-bold text-amber-800 mb-1">Notes:</p>
                    <p className="text-sm text-gray-700">{savedTweet.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
