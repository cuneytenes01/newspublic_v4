import { useState } from 'react';
import { TrendingUp, Sparkles, AlertCircle, Filter, Loader2, RefreshCw, Globe } from 'lucide-react';
import TweetCard from './TweetCard';
import { Tweet } from '../lib/supabase';

interface TrendingPageProps {
  onSummarize: (tweetId: string, content: string) => Promise<string>;
  onTranslate: (tweetId: string, content: string) => Promise<string>;
}

export default function TrendingPage({ onSummarize, onTranslate }: TrendingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minEngagement, setMinEngagement] = useState(1000);
  const [country, setCountry] = useState<'turkey' | 'global'>('turkey');
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'all', name: 'Tüm Konular', icon: Sparkles },
    { id: 'technology', name: 'Teknoloji', icon: TrendingUp },
    { id: 'politics', name: 'Politika', icon: TrendingUp },
    { id: 'sports', name: 'Spor', icon: TrendingUp },
    { id: 'entertainment', name: 'Eğlence', icon: TrendingUp },
    { id: 'business', name: 'İş Dünyası', icon: TrendingUp },
  ];

  const fetchTrendingTweets = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-trending-tweets`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          minEngagement,
          country
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trending tweets');
      }

      setTweets(data.tweets || []);
    } catch (err: any) {
      console.error('Error fetching trending tweets:', err);
      setError(err.message || 'Trend tweetler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Türkiye'de Trend
              </h2>
              <p className="text-gray-600 font-medium mt-1">
                Türkiye'de bugün en çok konuşulan konular ve tweetler
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Kategoriye Göre Filtrele</h3>
                  <p className="text-sm text-gray-600">İlgilendiğiniz konuları seçin</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCountry('turkey')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    country === 'turkey'
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Türkiye
                </button>
                <button
                  onClick={() => setCountry('global')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                    country === 'global'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Global
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-xl p-4 border border-orange-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Minimum Etkileşim
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={minEngagement}
                  onChange={(e) => setMinEngagement(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-gray-900 min-w-[80px] text-right">
                  {minEngagement.toLocaleString()}+
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                En az {minEngagement.toLocaleString()} toplam etkileşime sahip tweetleri göster (beğeni + retweet + yorum)
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={fetchTrendingTweets}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Tweetler alınıyor...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Trend Tweetleri Göster</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500 rounded-lg shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-red-800 font-bold mb-2">Twitter API Hatası</p>
                <p className="text-red-700 text-sm mb-3">
                  {error.includes('not configured')
                    ? 'Twitter API anahtarı yapılandırılmamış. Lütfen TWITTER_API_KEY ortam değişkenini ayarlayın.'
                    : error}
                </p>
                {error.includes('not configured') && (
                  <div className="bg-white rounded-lg p-3 text-xs text-gray-700 border border-red-200">
                    <p className="font-semibold mb-1">Nasıl Düzeltilir:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600">
                      <li>https://twitterapi.io adresinden API key alın</li>
                      <li>Supabase Dashboard'da Project Settings {'>'} Edge Functions'a gidin</li>
                      <li>TWITTER_API_KEY ortam değişkenini ekleyin</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tweets.length > 0 && (
          <div className="space-y-6">
            {tweets.map((tweet, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  {tweet.author_profile_image ? (
                    <img
                      src={tweet.author_profile_image}
                      alt={tweet.author_username}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{tweet.author_name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{tweet.author_name}</p>
                      <p className="text-gray-500 text-sm">@{tweet.author_username}</p>
                    </div>
                    <p className="text-sm text-gray-600">{new Date(tweet.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                </div>

                <p className="text-gray-900 text-base leading-relaxed mb-4">{tweet.text}</p>

                {tweet.media_urls && tweet.media_urls.length > 0 && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={tweet.media_urls[0]}
                      alt="Tweet media"
                      className="w-full h-auto"
                    />
                  </div>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{tweet.like_count.toLocaleString()}</span>
                    <span>Beğeni</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{tweet.retweet_count.toLocaleString()}</span>
                    <span>Retweet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{tweet.reply_count.toLocaleString()}</span>
                    <span>Yorum</span>
                  </div>
                  {tweet.view_count > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{tweet.view_count.toLocaleString()}</span>
                      <span>Görüntülenme</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tweets.length === 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-dashed border-blue-300">
          <div className="text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4">
              <AlertCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Trend Tweetler İçin Fetch Butonuna Basın</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              Filtreleri ayarladıktan sonra yukarıdaki "Trend Tweetleri Göster" butonuna basarak
              {country === 'turkey' ? ' Türkiye\'deki' : ' dünya genelindeki'} en popüler tweetleri görebilirsiniz.
            </p>
            <div className="bg-white rounded-xl p-4 max-w-xl mx-auto border border-blue-200">
              <p className="text-sm font-bold text-gray-700 mb-2">Nasıl Kullanılır:</p>
              <ul className="text-left text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Türkiye veya Global arasında seçim yapın</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>İlgilendiğiniz kategoriyi seçin (Teknoloji, Politika, Spor, vb.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Minimum etkileşim seviyesini ayarlayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>"Trend Tweetleri Göster" butonuna tıklayın</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
