import { useState, useEffect } from 'react';
import { Heart, Repeat2, MessageCircle, Sparkles, Languages, Loader2, Twitter, TrendingUp, Clock, BarChart3, X, Bookmark, BookmarkCheck, Smile, Frown, Meh, Link2 } from 'lucide-react';
import { Tweet, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TweetCardProps {
  tweet: Tweet;
  onSummarize: (tweetId: string, content: string) => Promise<string>;
  onTranslate: (tweetId: string, content: string) => Promise<string>;
  onBookmarkChange?: () => void;
  cardTheme?: 'default' | 'warm' | 'cool' | 'nature' | 'sunset';
}

export default function TweetCard({ tweet, onSummarize, onTranslate, onBookmarkChange, cardTheme = 'default' }: TweetCardProps) {
  const { user } = useAuth();
  const [showSummary, setShowSummary] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summary, setSummary] = useState(tweet.summary || '');
  const [translation, setTranslation] = useState(tweet.content_tr || '');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | 'neutral' | null>(tweet.sentiment);
  const [sentimentScore, setSentimentScore] = useState<number | null>(tweet.sentiment_score);
  const [sentimentReason, setSentimentReason] = useState<string>('');
  const [loadingSentiment, setLoadingSentiment] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [tweet.id, user]);

  const checkIfSaved = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_tweets')
        .select('id')
        .eq('user_id', user.id)
        .eq('tweet_id', tweet.id)
        .maybeSingle();

      if (error) throw error;
      setIsSaved(!!data);
    } catch (err) {
      console.error('Error checking if saved:', err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user || savingBookmark) return;

    setSavingBookmark(true);
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_tweets')
          .delete()
          .eq('user_id', user.id)
          .eq('tweet_id', tweet.id);

        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await supabase
          .from('saved_tweets')
          .insert({
            user_id: user.id,
            tweet_id: tweet.id,
            category: 'Uncategorized',
          });

        if (error) throw error;
        setIsSaved(true);
      }

      if (onBookmarkChange) {
        onBookmarkChange();
      }
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
      alert('Failed to save tweet');
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleSummarize = async () => {
    if (summary) {
      setShowSummaryModal(true);
      return;
    }

    setLoadingSummary(true);
    try {
      const result = await onSummarize(tweet.id, tweet.content);
      setSummary(result);
      setShowSummaryModal(true);
    } catch (error) {
      console.error('Failed to summarize:', error);
      alert('Özet oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleTranslate = async () => {
    if (translation && showTranslation) {
      setShowTranslation(false);
      return;
    }

    if (translation) {
      setShowTranslation(true);
      return;
    }

    setLoadingTranslation(true);
    try {
      const result = await onTranslate(tweet.id, tweet.content);
      setTranslation(result);
      setShowTranslation(true);
    } catch (error) {
      console.error('Failed to translate:', error);
      alert('Çeviri yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoadingTranslation(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getEngagementRate = () => {
    const total = tweet.like_count + tweet.retweet_count + tweet.reply_count;
    return total;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleAnalyzeSentiment = async () => {
    setLoadingSentiment(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-sentiment`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: tweet.content, tweetId: tweet.id }),
      });

      const result = await response.json();

      setSentiment(result.sentiment);
      setSentimentScore(result.score);
      setSentimentReason(result.reason || '');

      await supabase
        .from('tweets')
        .update({
          sentiment: result.sentiment,
          sentiment_score: result.score,
          sentiment_analyzed_at: new Date().toISOString(),
        })
        .eq('id', tweet.id);

    } catch (err) {
      console.error('Error analyzing sentiment:', err);
      alert('Sentiment analizi başarısız oldu');
    } finally {
      setLoadingSentiment(false);
    }
  };

  const getSentimentIcon = () => {
    if (!sentiment) return null;
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4" />;
      case 'negative': return <Frown className="w-4 h-4" />;
      case 'neutral': return <Meh className="w-4 h-4" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive': return 'from-green-500 to-emerald-500';
      case 'negative': return 'from-red-500 to-rose-500';
      case 'neutral': return 'from-gray-500 to-slate-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getSentimentBgColor = () => {
    switch (sentiment) {
      case 'positive': return 'bg-green-50 border-green-200 text-green-700';
      case 'negative': return 'bg-red-50 border-red-200 text-red-700';
      case 'neutral': return 'bg-gray-50 border-gray-200 text-gray-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getSentimentLabel = () => {
    switch (sentiment) {
      case 'positive': return 'Pozitif';
      case 'negative': return 'Negatif';
      case 'neutral': return 'Nötr';
      default: return 'Analiz Et';
    }
  };

  const engagement = getEngagementRate();

  const getThemeClasses = () => {
    switch (cardTheme) {
      case 'warm':
        return 'bg-gradient-to-br from-orange-100 via-orange-200 to-amber-300 border-orange-500';
      case 'cool':
        return 'bg-gradient-to-br from-cyan-100 via-cyan-200 to-teal-300 border-cyan-500';
      case 'nature':
        return 'bg-gradient-to-br from-green-100 via-green-200 to-emerald-300 border-green-500';
      case 'sunset':
        return 'bg-gradient-to-br from-pink-100 via-pink-200 to-rose-300 border-pink-500';
      default:
        return 'bg-gradient-to-br from-blue-100 via-blue-200 to-purple-300 border-blue-500';
    }
  };

  return (
    <div className={`group rounded-3xl border-2 p-7 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm ${getThemeClasses()}`}>
      <div className="flex items-start gap-3 mb-4">
        {tweet.twitter_users?.profile_image_url ? (
          <img
            src={tweet.twitter_users.profile_image_url}
            alt={tweet.twitter_users.username}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center">
            <Twitter className="w-6 h-6 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900">
              {tweet.twitter_users?.display_name || tweet.twitter_users?.username || 'Unknown'}
            </p>
            <p className="text-gray-500 text-sm">
              @{tweet.twitter_users?.username || 'unknown'}
            </p>

            {tweet.is_thread && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-lg text-xs font-bold text-purple-700">
                <Link2 className="w-3 h-3" />
                Thread {tweet.thread_position}
              </span>
            )}

            {sentiment && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${getSentimentBgColor()}`}>
                {getSentimentIcon()}
                {getSentimentLabel()}
                {sentimentScore && (
                  <span className="opacity-75">({Math.round(sentimentScore * 100)}%)</span>
                )}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatDate(tweet.created_at)}</p>
        </div>
      </div>

      {sentimentReason && (
        <div className="mb-4 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 shadow-sm">
          <p className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">Sentiment Açıklaması:</p>
          <p className="text-sm text-gray-800 leading-relaxed font-medium">{sentimentReason}</p>
        </div>
      )}

      <div className="mb-4 bg-white/95 rounded-2xl p-5 border border-gray-200 shadow-sm">
        <p className="text-gray-900 text-[15px] leading-[1.8] whitespace-pre-wrap break-words font-medium">
          {tweet.content}
        </p>
      </div>

      {showTranslation && translation && (
        <div className="mb-4 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-sm">
                <Languages className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-blue-900">Çeviri</span>
            </div>
            <button
              onClick={() => setShowTranslation(false)}
              className="p-1.5 hover:bg-blue-200 rounded-xl transition-colors"
            >
              <X className="w-4 h-4 text-blue-700" />
            </button>
          </div>
          <p className="text-gray-900 text-[15px] leading-[1.8] font-medium">{translation}</p>
        </div>
      )}

      {(tweet.media_urls && tweet.media_urls.length > 0) ? (
        <div className={`mb-4 gap-2 ${
          tweet.media_urls.length === 1 ? 'grid grid-cols-1' :
          tweet.media_urls.length === 2 ? 'grid grid-cols-2' :
          tweet.media_urls.length === 3 ? 'grid grid-cols-2' :
          'grid grid-cols-2'
        }`}>
          {tweet.media_urls.map((url, index) => {
            const mediaType = tweet.media_types?.[index] || 'photo';
            const isLastInOddGrid = tweet.media_urls!.length === 3 && index === 2;

            return (
              <div
                key={index}
                className={`rounded-2xl overflow-hidden border border-gray-200 ${
                  isLastInOddGrid ? 'col-span-2' : ''
                } ${tweet.media_urls!.length === 1 ? 'max-h-[600px]' : 'max-h-[350px]'}`}
              >
                {mediaType === 'photo' && (
                  <img
                    src={url}
                    alt={`Tweet media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {(mediaType === 'video' || mediaType === 'animated_gif') && (
                  <video
                    controls
                    className="w-full h-full object-cover bg-black"
                  >
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            );
          })}
        </div>
      ) : (tweet.media_type !== 'none' && tweet.media_url && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200 max-w-full">
          {tweet.media_type === 'photo' && (
            <img
              src={tweet.media_url}
              alt="Tweet media"
              className="w-full h-auto max-h-[600px] object-contain mx-auto"
            />
          )}
          {(tweet.media_type === 'video' || tweet.media_type === 'animated_gif') && (
            <video
              controls
              poster={tweet.media_thumbnail_url || undefined}
              className="w-full h-auto max-h-[500px] object-contain mx-auto bg-black"
            >
              <source src={tweet.media_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ))}

      <div className="mb-5 flex items-center justify-between text-xs flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full border border-rose-200 shadow-sm">
          <TrendingUp className="w-4 h-4 text-rose-600" />
          <span className="font-bold text-rose-700">{formatNumber(engagement)} engagements</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">{formatNumber(tweet.reply_count)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
            <Repeat2 className="w-4 h-4" />
            <span className="text-sm font-semibold">{formatNumber(tweet.retweet_count)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors cursor-pointer">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-semibold">{formatNumber(tweet.like_count)}</span>
          </div>
        </div>
      </div>

      {showSummaryModal && summary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowSummaryModal(false)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-6 border-b border-gray-100 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg animate-pulse">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">AI Analiz</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Detaylı ve Yapılandırılmış İçerik</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <div className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 rounded-2xl p-6 mb-6 border border-violet-200 shadow-sm">
                  <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap"
                       dangerouslySetInnerHTML={{
                         __html: summary
                           .replace(/📌 ANA FİKİR/g, '<div class="mb-4"><span class="inline-flex items-center gap-2 text-lg font-bold text-violet-700 mb-2">📌 ANA FİKİR</span>')
                           .replace(/🔍 DETAYLI AÇIKLAMA/g, '</div><div class="mb-4 mt-4"><span class="inline-flex items-center gap-2 text-lg font-bold text-fuchsia-700 mb-2">🔍 DETAYLI AÇIKLAMA</span>')
                           .replace(/💡 ÖNEMLİ NOKTALAR/g, '</div><div class="mb-4 mt-4"><span class="inline-flex items-center gap-2 text-lg font-bold text-pink-700 mb-2">💡 ÖNEMLİ NOKTALAR</span>')
                           .replace(/🎯 ETKİ & SONUÇ/g, '</div><div class="mb-4 mt-4"><span class="inline-flex items-center gap-2 text-lg font-bold text-rose-700 mb-2">🎯 ETKİ & SONUÇ</span>')
                           .replace(/• /g, '<br/>• ')
                           .replace(/\n/g, '<br/>')
                           + '</div>'
                       }}
                  />
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-gray-600 rounded-lg">
                    <Twitter className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">ORİJİNAL TWEET</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{tweet.content}</p>
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(tweet.created_at)}</span>
                  <span className="mx-2">•</span>
                  <span>@{tweet.twitter_users?.username}</span>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 p-6 border-t border-gray-100 bg-gradient-to-t from-gray-50 to-white">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="w-full py-3.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white rounded-xl font-bold hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center pt-5 border-t-2 border-gray-200/50">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={handleAnalyzeSentiment}
            disabled={loadingSentiment}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold disabled:opacity-50 shadow-sm hover:shadow-md transform hover:scale-105 ${
              sentiment
                ? `bg-gradient-to-r ${getSentimentColor()} text-white`
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-600'
            }`}
          >
            {loadingSentiment ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : sentiment ? (
              getSentimentIcon()
            ) : (
              <Meh className="w-4 h-4" />
            )}
            {loadingSentiment ? 'Analiz...' : (sentiment ? 'Yeniden Analiz' : 'Sentiment')}
          </button>
          <button
            onClick={handleToggleBookmark}
            disabled={savingBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold disabled:opacity-50 shadow-sm hover:shadow-md transform hover:scale-105 ${
              isSaved
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-amber-500 hover:text-amber-600'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save tweet'}
          >
            {savingBookmark ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleTranslate}
            disabled={loadingTranslation}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-semibold disabled:opacity-50 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            {loadingTranslation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Languages className="w-4 h-4" />
            )}
            Translate
          </button>
          <button
            onClick={handleSummarize}
            disabled={loadingSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 transition-all text-sm font-semibold disabled:opacity-50 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            {loadingSummary ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Summarize
          </button>
        </div>
      </div>
    </div>
  );
}
