import { useState, useEffect } from 'react';
import { supabase, TwitterUser, Tweet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import TweetCard from './TweetCard';
import TrendingPage from './TrendingPage';
import SavedTweetsPage from './SavedTweetsPage';
import DecorativeBackground from './DecorativeBackground';
import { Loader2, AlertCircle, RefreshCw, TrendingUp, Heart, MessageCircle, Repeat2, BarChart3, Sparkles, Users, Search, Import as SortAsc, Dessert as SortDesc, Download, FileSpreadsheet, FileText, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<'timeline' | 'trending' | 'saved'>('timeline');
  const [twitterUsers, setTwitterUsers] = useState<TwitterUser[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'engagement'>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [cardTheme, setCardTheme] = useState<'default' | 'warm' | 'cool' | 'nature' | 'sunset'>(() => {
    const saved = localStorage.getItem('cardTheme');
    return (saved as 'default' | 'warm' | 'cool' | 'nature' | 'sunset') || 'warm';
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [timeUntilNextFetch, setTimeUntilNextFetch] = useState<number>(300);

  useEffect(() => {
    loadTwitterUsers();
    loadTweets();

    const tweetsChannel = supabase
      .channel('tweets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tweets' }, () => {
        loadTweets();
      })
      .subscribe();

    const usersChannel = supabase
      .channel('twitter-users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'twitter_users' }, () => {
        loadTwitterUsers();
      })
      .subscribe();

    const autoFetchInterval = setInterval(async () => {
      console.log('Auto-fetching tweets for all users...');
      setLastFetchTime(new Date());
      setTimeUntilNextFetch(300);
      await handleFetchTweets(null);
    }, 5 * 60 * 1000);

    const countdownInterval = setInterval(() => {
      setTimeUntilNextFetch((prev) => Math.max(0, prev - 1));
    }, 1000);

    setLastFetchTime(new Date());

    return () => {
      supabase.removeChannel(tweetsChannel);
      supabase.removeChannel(usersChannel);
      clearInterval(autoFetchInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const loadTwitterUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('twitter_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTwitterUsers(data || []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message);
    }
  };

  const loadTweets = async () => {
    try {
      setLoading(true);
      const query = supabase
        .from('tweets')
        .select(`
          *,
          twitter_users (*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedUserId) {
        query.eq('twitter_user_id', selectedUserId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTweets(data || []);
    } catch (err: any) {
      console.error('Error loading tweets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const groupTweetsByThread = (tweets: Tweet[]) => {
    const threads: Map<string, Tweet[]> = new Map();
    const standalone: Tweet[] = [];

    tweets.forEach(tweet => {
      if (tweet.is_thread && tweet.thread_id) {
        const existing = threads.get(tweet.thread_id) || [];
        threads.set(tweet.thread_id, [...existing, tweet]);
      } else {
        standalone.push(tweet);
      }
    });

    threads.forEach((threadTweets, threadId) => {
      threads.set(threadId, threadTweets.sort((a, b) => a.thread_position - b.thread_position));
    });

    return { threads, standalone };
  };

  useEffect(() => {
    loadTweets();
  }, [selectedUserId]);

  const fetchTwitterTimeline = async (twitterUserId: string, username: string) => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-twitter-timeline`;
    console.log('Calling API:', apiUrl, { username, twitterUserId });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, twitterUserId }),
    });

    console.log('API Response status:', response.status);
    const responseData = await response.json();
    console.log('=== FRONTEND: Full API Response ===');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('=== END ===');

    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to fetch tweets');
    }

    if (responseData.count === 0) {
      console.warn('No tweets found. Possible reasons: Invalid API key, user has no tweets, or username not found');
    }

    return responseData;
  };

  const handleAddUser = async (username: string) => {
    try {
      const cleanUsername = username.replace('@', '');

      const { data, error } = await supabase
        .from('twitter_users')
        .insert({
          username: cleanUsername,
          display_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
          added_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTwitterTimeline(data.id, cleanUsername);
      await loadTwitterUsers();
      await loadTweets();
    } catch (err: any) {
      console.error('Error adding user:', err);
      throw err;
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('twitter_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }

      await loadTwitterUsers();
    } catch (err: any) {
      console.error('Error removing user:', err);
    }
  };

  const handleSyncTweets = async () => {
    setSyncing(true);
    setError('');
    try {
      const selectedUser = twitterUsers.find(u => u.id === selectedUserId);
      if (selectedUser) {
        await fetchTwitterTimeline(selectedUser.id, selectedUser.username);
        await loadTweets();
      }
    } catch (err: any) {
      console.error('Error syncing tweets:', err);
      setError(err.message || 'Failed to sync tweets');
    } finally {
      setSyncing(false);
    }
  };

  const handleFetchTweets = async (userId: string | null) => {
    setSyncing(true);
    setError('');
    try {
      if (userId === null) {
        for (const user of twitterUsers) {
          await fetchTwitterTimeline(user.id, user.username);
        }
      } else {
        const user = twitterUsers.find(u => u.id === userId);
        if (user) {
          await fetchTwitterTimeline(user.id, user.username);
        }
      }
      await loadTweets();
    } catch (err: any) {
      console.error('Error fetching tweets:', err);
      setError(err.message || 'Failed to fetch tweets');
    } finally {
      setSyncing(false);
    }
  };

  const handleSummarize = async (tweetId: string, content: string): Promise<string> => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-tweet`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API hatası');
      }

      const data = await response.json();
      const summary = data.summary;

      await supabase
        .from('tweets')
        .update({ summary })
        .eq('id', tweetId);

      return summary;
    } catch (err: any) {
      console.error('Error summarizing tweet:', err);
      alert(`Özet oluşturulamadı: ${err.message}`);
      throw err;
    }
  };

  const handleTranslate = async (tweetId: string, content: string): Promise<string> => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-tweet`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API hatası');
      }

      const data = await response.json();
      const translation = data.translation;

      await supabase
        .from('tweets')
        .update({ content_tr: translation })
        .eq('id', tweetId);

      return translation;
    } catch (err: any) {
      console.error('Error translating tweet:', err);
      alert(`Çeviri yapılamadı: ${err.message}`);
      throw err;
    }
  };

  const calculateStats = () => {
    if (tweets.length === 0) {
      return {
        totalEngagement: 0,
        avgLikes: 0,
        avgRetweets: 0,
        avgReplies: 0,
        mostEngaged: null
      };
    }

    const totalLikes = tweets.reduce((sum, t) => sum + t.like_count, 0);
    const totalRetweets = tweets.reduce((sum, t) => sum + t.retweet_count, 0);
    const totalReplies = tweets.reduce((sum, t) => sum + t.reply_count, 0);
    const totalEngagement = totalLikes + totalRetweets + totalReplies;

    const mostEngaged = [...tweets].sort((a, b) => {
      const aTotal = a.like_count + a.retweet_count + a.reply_count;
      const bTotal = b.like_count + b.retweet_count + b.reply_count;
      return bTotal - aTotal;
    })[0];

    return {
      totalEngagement,
      avgLikes: Math.round(totalLikes / tweets.length),
      avgRetweets: Math.round(totalRetweets / tweets.length),
      avgReplies: Math.round(totalReplies / tweets.length),
      mostEngaged
    };
  };

  const stats = calculateStats();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  useEffect(() => {
    localStorage.setItem('cardTheme', cardTheme);
  }, [cardTheme]);

  const filterAndSortTweets = (tweets: Tweet[]) => {
    let filtered = tweets;

    if (searchQuery.trim()) {
      filtered = filtered.filter(tweet =>
        tweet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tweet.twitter_users?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tweet.twitter_users?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    let sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        break;
      case 'popular':
        sorted.sort((a, b) => {
          const scoreA = a.like_count + a.retweet_count + a.reply_count;
          const scoreB = b.like_count + b.retweet_count + b.reply_count;
          return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        });
        break;
      case 'engagement':
        sorted.sort((a, b) => {
          const engagementA = a.like_count * 1 + a.retweet_count * 2 + a.reply_count * 3;
          const engagementB = b.like_count * 1 + b.retweet_count * 2 + b.reply_count * 3;
          return sortOrder === 'desc' ? engagementB - engagementA : engagementA - engagementB;
        });
        break;
    }

    return sorted;
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      const filteredTweets = filterAndSortTweets(tweets);
      const csvContent = [
        ['Username', 'Display Name', 'Content', 'Likes', 'Retweets', 'Replies', 'Date', 'URL'].join(','),
        ...filteredTweets.map(tweet =>
          [
            `"${tweet.twitter_users?.username || ''}"`,
            `"${tweet.twitter_users?.display_name || ''}"`,
            `"${tweet.content.replace(/"/g, '""')}"`,
            tweet.like_count,
            tweet.retweet_count,
            tweet.reply_count,
            `"${new Date(tweet.created_at).toLocaleString()}"`,
            `"${tweet.tweet_url || ''}"`,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tweets_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportMenu(false);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = () => {
    setExporting(true);
    try {
      const filteredTweets = filterAndSortTweets(tweets);
      const jsonData = filteredTweets.map(tweet => ({
        username: tweet.twitter_users?.username,
        displayName: tweet.twitter_users?.display_name,
        content: tweet.content,
        likes: tweet.like_count,
        retweets: tweet.retweet_count,
        replies: tweet.reply_count,
        date: tweet.created_at,
        url: tweet.tweet_url,
        sentiment: tweet.sentiment,
        mediaType: tweet.media_type,
      }));

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tweets_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportMenu(false);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const filteredTweets = filterAndSortTweets(tweets);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      <DecorativeBackground />
      <Sidebar
        twitterUsers={twitterUsers}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onFetchTweets={handleFetchTweets}
      />

      {currentPage === 'trending' && (
        <TrendingPage
          onSummarize={handleSummarize}
          onTranslate={handleTranslate}
        />
      )}

      {currentPage === 'saved' && (
        <SavedTweetsPage
          onSummarize={handleSummarize}
          onTranslate={handleTranslate}
        />
      )}

      {currentPage === 'timeline' && (
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    {selectedUserId
                      ? `@${twitterUsers.find(u => u.id === selectedUserId)?.username || ''}`
                      : 'All Users'}
                  </h2>
                  <div className="space-y-1">
                    <p className="text-gray-600 font-medium">
                      {filteredTweets.length} of {tweets.length} tweet{tweets.length !== 1 ? 's' : ''}
                    </p>
                    {lastFetchTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-500 font-medium">
                          Last scan: {Math.floor((Date.now() - lastFetchTime.getTime()) / 1000 / 60)} min ago
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-blue-600 font-semibold">
                          Next scan in {Math.floor(timeUntilNextFetch / 60)}:{String(timeUntilNextFetch % 60).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => selectedUserId ? handleSyncTweets() : handleFetchTweets(null)}
                  disabled={syncing}
                  className="group relative px-6 py-3.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-full transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2.5 font-bold text-sm overflow-hidden"
                  title={selectedUserId ? "Fetch tweets from selected user" : "Fetch tweets from all users"}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                      <span className="relative z-10">Fetching...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Fetch Tweets</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button
                    className="p-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-500 transition-all shadow-sm hover:shadow-md"
                    title="Card Theme"
                  >
                    <div className={`w-5 h-5 rounded-md ${
                      cardTheme === 'warm' ? 'bg-gradient-to-br from-orange-400 to-amber-400' :
                      cardTheme === 'cool' ? 'bg-gradient-to-br from-cyan-400 to-teal-400' :
                      cardTheme === 'nature' ? 'bg-gradient-to-br from-green-400 to-emerald-400' :
                      cardTheme === 'sunset' ? 'bg-gradient-to-br from-pink-400 to-rose-400' :
                      'bg-gradient-to-br from-blue-400 to-purple-400'
                    }`}></div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-3 px-2 hidden group-hover:block transition-all duration-200 z-20">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 px-2">Card Theme</p>
                    <button
                      onClick={() => setCardTheme('default')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 ${cardTheme === 'default' ? 'bg-blue-100 border-2 border-blue-500' : ''}`}
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-400 to-purple-400 shadow-sm"></div>
                      <span className="font-semibold text-sm">Default</span>
                    </button>
                    <button
                      onClick={() => setCardTheme('warm')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 ${cardTheme === 'warm' ? 'bg-orange-100 border-2 border-orange-500' : ''}`}
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-400 to-amber-400 shadow-sm"></div>
                      <span className="font-semibold text-sm">Warm</span>
                    </button>
                    <button
                      onClick={() => setCardTheme('cool')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 ${cardTheme === 'cool' ? 'bg-cyan-100 border-2 border-cyan-500' : ''}`}
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-teal-400 shadow-sm"></div>
                      <span className="font-semibold text-sm">Cool</span>
                    </button>
                    <button
                      onClick={() => setCardTheme('nature')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 ${cardTheme === 'nature' ? 'bg-green-100 border-2 border-green-500' : ''}`}
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-400 to-emerald-400 shadow-sm"></div>
                      <span className="font-semibold text-sm">Nature</span>
                    </button>
                    <button
                      onClick={() => setCardTheme('sunset')}
                      className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 ${cardTheme === 'sunset' ? 'bg-pink-100 border-2 border-pink-500' : ''}`}
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-400 to-rose-400 shadow-sm"></div>
                      <span className="font-semibold text-sm">Sunset</span>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-green-500 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    <span className="font-semibold">Export</span>
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10">
                      <button
                        onClick={exportToCSV}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Export CSV</span>
                      </button>
                      <button
                        onClick={exportToJSON}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Export JSON</span>
                      </button>
                    </div>
                  )}
                </div>
                {selectedUserId && (
                  <button
                    onClick={handleSyncTweets}
                    disabled={syncing}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                    Sync Tweets
                  </button>
                )}
              </div>
            </div>

            <div className="mb-6 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tweets, usernames, or content..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'engagement')}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="engagement">Most Engaged</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                  >
                    {sortOrder === 'desc' ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {tweets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(stats.totalEngagement)}</p>
                  <p className="text-sm font-semibold text-gray-500">Total Engagement</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(stats.avgLikes)}</p>
                  <p className="text-sm font-semibold text-gray-500">Avg Likes</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <Repeat2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(stats.avgRetweets)}</p>
                  <p className="text-sm font-semibold text-gray-500">Avg Retweets</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(stats.avgReplies)}</p>
                  <p className="text-sm font-semibold text-gray-500">Avg Replies</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0"></div>
              </div>
              <p className="mt-6 text-gray-600 font-semibold">Loading tweets...</p>
            </div>
          ) : tweets.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
              <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4">
                <Sparkles className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-gray-700 text-xl font-bold mb-2">No tweets yet</p>
              <p className="text-gray-500 font-medium">
                {selectedUserId
                  ? 'Click "Sync Tweets" to load tweets from Twitter'
                  : 'Add a Twitter user to start monitoring their tweets'}
              </p>
            </div>
          ) : filteredTweets.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
              <div className="inline-flex p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4">
                <Search className="w-12 h-12 text-amber-600" />
              </div>
              <p className="text-gray-700 text-xl font-bold mb-2">No tweets found</p>
              <p className="text-gray-500 font-medium">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                const { threads, standalone } = groupTweetsByThread(filteredTweets);

                return (
                  <>
                    {Array.from(threads.entries()).map(([threadId, threadTweets]) => (
                      <div key={threadId} className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-pink-400 to-purple-400 opacity-30"></div>
                        <div className="space-y-3 relative">
                          <div className="flex items-center gap-2 mb-2 ml-2">
                            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                              Thread - {threadTweets.length} tweets
                            </span>
                          </div>
                          {threadTweets.map((tweet) => (
                            <TweetCard
                              key={tweet.id}
                              tweet={tweet}
                              onSummarize={handleSummarize}
                              onTranslate={handleTranslate}
                              cardTheme={cardTheme}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    {standalone.map((tweet) => (
                      <TweetCard
                        key={tweet.id}
                        tweet={tweet}
                        onSummarize={handleSummarize}
                        onTranslate={handleTranslate}
                        cardTheme={cardTheme}
                      />
                    ))}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
