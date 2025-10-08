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
    { id: 'all', name: 'All Topics', icon: Sparkles },
    { id: 'ai', name: 'Artificial Intelligence', icon: TrendingUp },
    { id: 'tech', name: 'Technology', icon: TrendingUp },
    { id: 'business', name: 'Business', icon: TrendingUp },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp },
    { id: 'crypto', name: 'Cryptocurrency', icon: TrendingUp },
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
                Discover Trending
              </h2>
              <p className="text-gray-600 font-medium mt-1">
                High-engagement content from beyond your followed users
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Filter by Category</h3>
                <p className="text-sm text-gray-600">Select topics that interest you</p>
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
                Minimum Engagement
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
                Show tweets with at least {minEngagement.toLocaleString()} total engagements (likes + retweets + replies)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-dashed border-blue-300">
          <div className="text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4">
              <AlertCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Trending Discovery Coming Soon</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              This feature will help you discover high-engagement tweets from users you don't follow yet,
              based on your selected categories and minimum engagement thresholds.
            </p>
            <div className="bg-white rounded-xl p-4 max-w-xl mx-auto border border-blue-200">
              <p className="text-sm font-bold text-gray-700 mb-2">What you'll be able to do:</p>
              <ul className="text-left text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Discover trending tweets in your areas of interest (AI, Tech, Business, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Filter by engagement metrics to find the most viral content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Quickly follow new users directly from their trending tweets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Get daily/weekly digests of top trending content</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              This feature requires Twitter API v2 access with elevated permissions.
              Implementation is ready and waiting for API access upgrade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
