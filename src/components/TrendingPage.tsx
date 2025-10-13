import { useState } from 'react';
import { TrendingUp, Sparkles, AlertCircle, Filter } from 'lucide-react';
import TweetCard from './TweetCard';
import { Tweet } from '../lib/supabase';

interface TrendingPageProps {
  onSummarize: (tweetId: string, content: string) => Promise<string>;
  onTranslate: (tweetId: string, content: string) => Promise<string>;
}

export default function TrendingPage({ onSummarize, onTranslate }: TrendingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minEngagement, setMinEngagement] = useState(1000);

  const categories = [
    { id: 'all', name: 'Tüm Konular', icon: Sparkles },
    { id: 'technology', name: 'Teknoloji', icon: TrendingUp },
    { id: 'politics', name: 'Politika', icon: TrendingUp },
    { id: 'sports', name: 'Spor', icon: TrendingUp },
    { id: 'entertainment', name: 'Eğlence', icon: TrendingUp },
    { id: 'business', name: 'İş Dünyası', icon: TrendingUp },
  ];

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
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Kategoriye Göre Filtrele</h3>
                <p className="text-sm text-gray-600">İlgilendiğiniz konuları seçin</p>
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
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-dashed border-blue-300">
          <div className="text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4">
              <AlertCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Trend Keşfi Çok Yakında</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              Bu özellik, seçtiğiniz kategorilere ve minimum etkileşim eşiklerine göre,
              henüz takip etmediğiniz kullanıcılardan yüksek etkileşimli tweetleri keşfetmenize yardımcı olacak.
            </p>
            <div className="bg-white rounded-xl p-4 max-w-xl mx-auto border border-blue-200">
              <p className="text-sm font-bold text-gray-700 mb-2">Yapabilecekleriniz:</p>
              <ul className="text-left text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>İlgilendiğiniz alanlarda (Teknoloji, Politika, Spor, vb.) trend olan tweetleri keşfedin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Etkileşim metriklerine göre filtrele ve en viral içerikleri bulun</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Trend tweetlerden doğrudan yeni kullanıcıları hızlıca takip edin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Günlük/haftalık en popüler içerik özetleri alın</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Bu özellik, Twitter API v2 erişimi ve yükseltilmiş izinler gerektirir.
              Implementasyon hazır ve API erişim yükseltmesi bekleniyor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
