import { useState, useEffect } from 'react';
import { supabase, TwitterUser, Tweet, UserTag } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import TweetCard from './TweetCard';
import TrendingPage from './TrendingPage';
import SavedTweetsPage from './SavedTweetsPage';
import DecorativeBackground from './DecorativeBackground';
import ApiSettings from './ApiSettings';
import { Loader2, AlertCircle, RefreshCw, TrendingUp, Heart, MessageCircle, Repeat2, BarChart3, Sparkles, Users, Search, Download, FileSpreadsheet, FileText, Settings, Tag } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<'timeline' | 'trending' | 'saved'>('timeline');
  const [twitterUsers, setTwitterUsers] = useState<TwitterUser[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [tags, setTags] = useState<UserTag[]>([]);
  const [userTags, setUserTags] = useState<Map<string, UserTag[]>>(new Map());
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
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    loadTwitterUsers();
    loadTags();
    loadUserTags();
  }, []);

  useEffect(() => {
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

    return () => {
      supabase.removeChannel(tweetsChannel);
      supabase.removeChannel(usersChannel);
    };
  }, [selectedUserId, selectedTagId]);

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

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('user_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const loadUserTags = async () => {
    try {
      const { data, error } = await supabase
        .from('twitter_user_tags')
        .select('*, user_tags(*)')
        .order('assigned_at', { ascending: true });

      if (error) throw error;

      const tagMap = new Map<string, UserTag[]>();
      data?.forEach((item: any) => {
        if (item.user_tags) {
          const existing = tagMap.get(item.twitter_user_id) || [];
          tagMap.set(item.twitter_user_id, [...existing, item.user_tags]);
        }
      });

      setUserTags(tagMap);
    } catch (err) {
      console.error('Error loading user tags:', err);
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
      } else if (selectedTagId) {
        const { data: userTagsData } = await supabase
          .from('twitter_user_tags')
          .select('twitter_user_id, user_tags(*)')
          .eq('tag_id', selectedTagId)
          .order('assigned_at', { ascending: true });

        if (userTagsData && userTagsData.length > 0) {
          const userIdsGroupedByUser = new Map<string, boolean>();
          userTagsData.forEach((item: any) => {
            if (!userIdsGroupedByUser.has(item.twitter_user_id)) {
              userIdsGroupedByUser.set(item.twitter_user_id, true);
            }
          });

          const userIds = Array.from(userIdsGroupedByUser.keys());
          query.in('twitter_user_id', userIds);
        } else {
          setTweets([]);
          setLoading(false);
          return;
        }
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
          const shouldFetch = await checkIfShouldFetch(user.id);
          if (shouldFetch) {
            await fetchTwitterTimeline(user.id, user.username);
            await updateLastFetchedAt(user.id);
          } else {
            console.log(`Skipping @${user.username} - fetched less than 1 hour ago`);
          }
        }
      } else {
        const user = twitterUsers.find(u => u.id === userId);
        if (user) {
          const shouldFetch = await checkIfShouldFetch(user.id);
          if (shouldFetch) {
            await fetchTwitterTimeline(user.id, user.username);
            await updateLastFetchedAt(user.id);
          } else {
            setError(`@${user.username} was fetched less than 1 hour ago. Please wait before fetching again.`);
            setSyncing(false);
            return;
          }
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

  const checkIfShouldFetch = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('twitter_users')
        .select('last_fetched_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!data.last_fetched_at) {
        return true;
      }

      const lastFetched = new Date(data.last_fetched_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60);

      return hoursDiff >= 1;
    } catch (err) {
      console.error('Error checking fetch status:', err);
      return true;
    }
  };

  const updateLastFetchedAt = async (userId: string) => {
    try {
      await supabase
        .from('twitter_users')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (err) {
      console.error('Error updating last_fetched_at:', err);
    }
  };

  const handleSummarize = async (tweetId: string, content: string): Promise<string> => {
    try {
      const apiKey = localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY;
      const selectedModel = localStorage.getItem('openrouter_model') || 'google/gemini-flash-1.5-latest';
      const summarizePrompt = localStorage.getItem('openrouter_summarize_prompt') || 'Sen bir tweet analiz uzmanısın. Tweet\'i Türkçe olarak özetle. Basit ve anlaşılır dil kullan. 2-3 cümle ile özetle.';

      if (!apiKey) {
        alert('Please set your OpenRouter API key in settings');
        setShowApiSettings(true);
        throw new Error('API key not configured');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Twitter Monitoring App',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: summarizePrompt,
            },
            {
              role: 'user',
              content: `Bu tweet'i Türkçe özetle:\n\n"${content}"`,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API Error:', response.status, errorData);
        throw new Error(`API hatası (${response.status}): ${errorData.error?.message || 'Bilinmeyen hata'}`);
      }

      const data = await response.json();
      console.log('OpenRouter response:', data);
      const summary = data.choices?.[0]?.message?.content;

      if (!summary) {
        throw new Error('API yanıt formatı hatalı');
      }

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
      const apiKey = localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY;
      const selectedModel = localStorage.getItem('openrouter_model') || 'google/gemini-flash-1.5-latest';
      const translatePrompt = localStorage.getItem('openrouter_translate_prompt') || 'You are a translator. Only provide the translation, nothing else.';

      if (!apiKey) {
        alert('Please set your OpenRouter API key in settings');
        setShowApiSettings(true);
        throw new Error('API key not configured');
      }

      const turkishChars = /[ğüşıöçĞÜŞİÖÇ]/;
      const isTurkish = turkishChars.test(content);

      const systemPrompt = isTurkish
        ? `${translatePrompt}\n\nTranslate the given Turkish text to English.`
        : `${translatePrompt}\n\nTranslate the given text to Turkish.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Twitter Monitoring App',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: content,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API Error:', response.status, errorData);
        throw new Error(`API hatası (${response.status}): ${errorData.error?.message || 'Bilinmeyen hata'}`);
      }

      const data = await response.json();
      console.log('OpenRouter response:', data);
      const translation = data.choices?.[0]?.message?.content;

      if (!translation) {
        throw new Error('API yanıt formatı hatalı');
      }

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
        selectedTagId={selectedTagId}
        onSelectTag={setSelectedTagId}
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
        <div className="max-w-6xl mx-auto p-8">
          <div className="mb-8">

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filter by Category</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mb-6">
                <button
                  onClick={() => {
                    setSelectedTagId(null);
                    setSelectedUserId(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-[1.02] ${
                    selectedTagId === null
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>All Users</span>
                  </div>
                </button>
                {tags.map((tag) => {
                  const usersWithThisTag = twitterUsers.filter((user) => {
                    const userTagList = userTags.get(user.id) || [];
                    return userTagList.length > 0 && userTagList[0].id === tag.id;
                  });

                  if (usersWithThisTag.length === 0) return null;

                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTagId(tag.id);
                        setSelectedUserId(null);
                      }}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 transform hover:scale-[1.02] ${
                        selectedTagId === tag.id
                          ? 'text-white shadow-md hover:shadow-lg'
                          : 'hover:opacity-90 border-2'
                      }`}
                      style={{
                        backgroundColor: selectedTagId === tag.id ? tag.color : `${tag.color}15`,
                        color: selectedTagId === tag.id ? 'white' : tag.color,
                        borderColor: selectedTagId === tag.id ? 'transparent' : `${tag.color}40`
                      }}
                    >
                      <Tag className="w-4 h-4" />
                      <span>{tag.name}</span>
                      <span className={`ml-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                        selectedTagId === tag.id ? 'bg-white/25 text-white' : 'bg-white/90'
                      }`}
                      style={{
                        color: selectedTagId === tag.id ? 'white' : tag.color
                      }}>
                        {usersWithThisTag.length}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">
                    {selectedTagId
                      ? tags.find(t => t.id === selectedTagId)?.name || 'All Users'
                      : selectedUserId
                      ? `@${twitterUsers.find(u => u.id === selectedUserId)?.username || ''}`
                      : 'All Users'}
                  </h2>
                  <button
                    onClick={() => selectedUserId ? handleSyncTweets() : handleFetchTweets(null)}
                    disabled={syncing}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-[1.02]"
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Fetching...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-sm">Fetch Tweets</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowApiSettings(true)}
                    className="px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md group flex items-center gap-2"
                    title="API Settings"
                  >
                    <Settings className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Settings</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowThemeMenu(!showThemeMenu)}
                      className="px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                      title="Card Theme"
                    >
                      <div className={`w-4 h-4 rounded-md shadow-sm ${
                        cardTheme === 'warm' ? 'bg-gradient-to-br from-orange-400 to-amber-400' :
                        cardTheme === 'cool' ? 'bg-gradient-to-br from-cyan-400 to-teal-400' :
                        cardTheme === 'nature' ? 'bg-gradient-to-br from-green-400 to-emerald-400' :
                        cardTheme === 'sunset' ? 'bg-gradient-to-br from-pink-400 to-rose-400' :
                        'bg-gradient-to-br from-blue-400 to-cyan-400'
                      }`}></div>
                      <span className="text-xs font-semibold text-gray-700">Theme</span>
                    </button>
                    {showThemeMenu && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 px-2 z-20">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 px-2">Card Theme</p>
                      <button
                        onClick={() => { setCardTheme('default'); setShowThemeMenu(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all hover:bg-gray-50 ${cardTheme === 'default' ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-400 to-cyan-400 shadow-sm"></div>
                        <span className="font-semibold text-sm text-gray-700">Default</span>
                      </button>
                      <button
                        onClick={() => { setCardTheme('warm'); setShowThemeMenu(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all hover:bg-gray-50 ${cardTheme === 'warm' ? 'bg-orange-50 ring-2 ring-orange-500' : ''}`}
                      >
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-400 to-amber-400 shadow-sm"></div>
                        <span className="font-semibold text-sm text-gray-700">Warm</span>
                      </button>
                      <button
                        onClick={() => { setCardTheme('cool'); setShowThemeMenu(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all hover:bg-gray-50 ${cardTheme === 'cool' ? 'bg-cyan-50 ring-2 ring-cyan-500' : ''}`}
                      >
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-teal-400 shadow-sm"></div>
                        <span className="font-semibold text-sm text-gray-700">Cool</span>
                      </button>
                      <button
                        onClick={() => { setCardTheme('nature'); setShowThemeMenu(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all hover:bg-gray-50 ${cardTheme === 'nature' ? 'bg-green-50 ring-2 ring-green-500' : ''}`}
                      >
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-400 to-emerald-400 shadow-sm"></div>
                        <span className="font-semibold text-sm text-gray-700">Nature</span>
                      </button>
                      <button
                        onClick={() => { setCardTheme('sunset'); setShowThemeMenu(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all hover:bg-gray-50 ${cardTheme === 'sunset' ? 'bg-pink-50 ring-2 ring-pink-500' : ''}`}
                      >
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-400 to-rose-400 shadow-sm"></div>
                        <span className="font-semibold text-sm text-gray-700">Sunset</span>
                      </button>
                    </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={exporting}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 group"
                    >
                      {exporting ? <Loader2 className="w-4 h-4 animate-spin text-gray-600" /> : <Download className="w-4 h-4 text-gray-600 group-hover:text-green-600 transition-colors" />}
                      <span className="text-xs font-semibold text-gray-700 group-hover:text-green-600 transition-colors">Export</span>
                    </button>
                    {showExportMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20">
                        <button
                          onClick={exportToCSV}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-sm text-gray-700">Export CSV</span>
                        </button>
                        <button
                          onClick={exportToJSON}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-sm text-gray-700">Export JSON</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

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

      {showApiSettings && (
        <ApiSettings onClose={() => setShowApiSettings(false)} />
      )}
    </div>
  );
}
