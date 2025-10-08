import { useState } from 'react';
import { TrendingUp, Twitter, Youtube, LayoutGrid as Layout, LogOut } from 'lucide-react';
import Dashboard from './Dashboard';
import { useAuth } from '../contexts/AuthContext';

type Page = 'dashboard' | 'twitter' | 'youtube';

export default function MainApp() {
  const [currentPage, setCurrentPage] = useState<Page>('twitter');
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <nav className="max-w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">Social Monitor</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layout className="w-5 h-5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentPage('twitter')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 'twitter'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Twitter className="w-5 h-5" />
                <span>Twitter</span>
              </button>

              <button
                onClick={() => setCurrentPage('youtube')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 'youtube'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Youtube className="w-5 h-5" />
                <span>Youtube</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </nav>
      </header>

      <main className="pt-16">
        {currentPage === 'dashboard' && <DashboardOverview />}
        {currentPage === 'twitter' && <Dashboard />}
        {currentPage === 'youtube' && <YoutubeView />}
      </main>
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Overview of your social media monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Twitter className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">+12%</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">1,234</div>
            <div className="text-slate-400 text-sm">Total Tweets</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">+8%</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">43.4K</div>
            <div className="text-slate-400 text-sm">Total Engagement</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Youtube className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">+5%</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">892</div>
            <div className="text-slate-400 text-sm">Youtube Videos</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Layout className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">+15%</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">24</div>
            <div className="text-slate-400 text-sm">Active Monitors</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Twitter className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium mb-1">New tweet from @user{i}</div>
                    <div className="text-slate-400 text-sm">5 minutes ago</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Top Performing</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg"></div>
                    <div>
                      <div className="text-white font-medium">Content {i}</div>
                      <div className="text-slate-400 text-sm">1.2K engagements</div>
                    </div>
                  </div>
                  <div className="text-green-400 text-sm font-medium">+{12 + i}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function YoutubeView() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Youtube Monitoring</h1>
          <p className="text-slate-400">Track and analyze Youtube videos and channels</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Youtube className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Youtube Monitoring Coming Soon</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            We're working on bringing comprehensive Youtube monitoring capabilities to the platform.
            Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
}
