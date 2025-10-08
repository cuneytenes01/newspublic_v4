import { useState } from 'react';
import { TrendingUp, Zap, Clock, Shield, Users, Activity, DollarSign, CheckCircle2, TrendingUp as TrendUp, BarChart3, Crown, Sparkles, ArrowRight, Play, LayoutDashboard, Twitter, Youtube } from 'lucide-react';
import AuthForm from './AuthForm';
import GlobalSentimentCard from './GlobalSentimentCard';
import ViralRadarCard from './ViralRadarCard';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0e27] relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {[...Array(30)].map((_, i) => {
            const x1 = Math.random() * 100;
            const y1 = Math.random() * 100;
            const x2 = Math.random() * 100;
            const y2 = Math.random() * 100;
            return (
              <line
                key={i}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="url(#line-gradient)"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}
          {[...Array(250)].map((_, i) => {
            const cx = Math.random() * 100;
            const cy = Math.random() * 100;
            const r = Math.random() * 2 + 1;
            return (
              <circle
                key={`dot-${i}`}
                cx={`${cx}%`}
                cy={`${cy}%`}
                r={r}
                fill={i % 3 === 0 ? '#3b82f6' : '#ffffff'}
                opacity={Math.random() * 0.5 + 0.2}
              />
            );
          })}
        </svg>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e27]/90 backdrop-blur-xl border-b border-slate-800/50">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-blue-500" />
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Youtube className="w-4 h-4" />
              <span>Youtube</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/30"
            >
              Sign In
            </button>
          </div>
        </nav>
      </header>

      <main className="pt-16 relative">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-base mb-10 backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
              <span>#1 Best Twitter(X) Analytics</span>
            </div>

            <h1 className="text-7xl md:text-9xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                AI Social
              </span>
              <br />
              <span className="text-white">Intelligence</span>
            </h1>

            <p className="text-2xl md:text-3xl text-slate-400 mb-16 max-w-4xl mx-auto leading-relaxed">
              The <span className="text-blue-400 font-semibold">world's fastest</span>,
              <span className="text-purple-400 font-semibold"> most affordable</span>, and
              <span className="text-pink-400 font-semibold"> most reliable</span> X/Twitter monitoring platform
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all">
                <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">1,000+</div>
                <div className="text-slate-400 text-base">Requests/sec</div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                <Clock className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">500ms</div>
                <div className="text-slate-400 text-base">Response Time</div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-green-500/50 transition-all">
                <Shield className="w-10 h-10 text-green-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">99%</div>
                <div className="text-slate-400 text-base">Uptime</div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-all">
                <Users className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">10,000+</div>
                <div className="text-slate-400 text-base">Developers</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-slate-300 text-base">Pay as u go</div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 text-center">
                <Activity className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-slate-300 text-base">RealTime Data</div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 text-center">
                <BarChart3 className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-slate-300 text-base">Historical Data</div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 text-center">
                <TrendUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-slate-300 text-base">Always Evolving</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setShowAuth(true)}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-2xl shadow-purple-500/30 flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-base">$0 Free Credits • No Credit Card Required</span>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-gradient-to-b from-transparent to-slate-900/50 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                AI Command Center
              </h2>
              <p className="text-xl text-slate-400">
                Real-time social media intelligence at your fingertips
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6 mb-12">
              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">LIVE</span>
                </div>
                <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">AI</div>
                <div className="text-slate-400 text-sm">Analyzing</div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">+12%</span>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">0.0K</div>
                <div className="text-slate-400 text-sm">Active Mentions</div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-green-500/50 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">+5%</span>
                </div>
                <TrendUp className="w-8 h-8 text-green-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">8.6/10</div>
                <div className="text-slate-400 text-sm">Sentiment Score</div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">+23%</span>
                </div>
                <Users className="w-8 h-8 text-cyan-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">0.1M</div>
                <div className="text-slate-400 text-sm">Reach</div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-yellow-500/50 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">+8%</span>
                </div>
                <Zap className="w-8 h-8 text-yellow-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">1%</div>
                <div className="text-slate-400 text-sm">Viral Potential</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <GlobalSentimentCard />

              <ViralRadarCard />
            </div>
          </div>
        </section>

        <section id="stats" className="py-24 bg-slate-900/30 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Trusted by Thousands
                </span>
              </h2>
              <p className="text-xl text-slate-400">
                Join the revolution of data-driven social media intelligence
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all">
                <div className="text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">15.2M+</span>
                </div>
                <div className="text-slate-400 mb-2">Tweets Analyzed</div>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:border-green-500/50 transition-all">
                <div className="text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">94%</span>
                </div>
                <div className="text-slate-400 mb-2">AI Accuracy</div>
                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-all">
                <div className="text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">1.2K+</span>
                </div>
                <div className="text-slate-400 mb-2">Active Users</div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 text-center hover:border-orange-500/50 transition-all">
                <div className="text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">99.9%</span>
                </div>
                <div className="text-slate-400 mb-2">Uptime</div>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Choose Your Plan
                </span>
              </h2>
              <p className="text-xl text-slate-400">
                Start free and scale as you grow. All plans include our core AI intelligence features.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-3xl p-8 hover:border-slate-700 transition-all">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Free</h3>
                <p className="text-slate-400 mb-6">Perfect for getting started</p>

                <div className="mb-8">
                  <div className="text-5xl font-bold text-white mb-1">$0</div>
                  <div className="text-slate-400">/forever</div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">1,000 posts analyzed/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Basic sentiment analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">3 trending topics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Email support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Basic dashboard</span>
                  </li>
                </ul>

                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all"
                >
                  Start Free
                </button>
              </div>

              <div className="bg-gradient-to-b from-blue-900/70 to-purple-900/70 backdrop-blur-sm border-2 border-blue-500/50 rounded-3xl p-8 relative hover:border-blue-400 transition-all transform hover:scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
                    🔥 MOST POPULAR
                  </span>
                </div>

                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Pro</h3>
                <p className="text-blue-200 mb-6">Most popular for growing businesses</p>

                <div className="mb-8">
                  <div className="text-5xl font-bold text-white mb-1">$29</div>
                  <div className="text-blue-200">/month</div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white">50,000 posts analyzed/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white">Advanced AI predictions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white">Unlimited trending topics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white">Real-time alerts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white">Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white">API access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white">Priority support</span>
                  </li>
                </ul>

                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-xl shadow-blue-500/30"
                >
                  Start Pro Trial
                </button>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-3xl p-8 hover:border-orange-500/50 transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-slate-400 mb-6">For large organizations</p>

                <div className="mb-8">
                  <div className="text-5xl font-bold text-white mb-1">$99</div>
                  <div className="text-slate-400">/month</div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Unlimited posts analyzed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Custom AI models</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">White-label solution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">SLA guarantee</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">24/7 phone support</span>
                  </li>
                </ul>

                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-medium transition-all"
                >
                  Start Enterprise Trial
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">No Credit Card</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">14-Day Free Trial</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-transparent to-slate-900/50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Social Media Intelligence?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join thousands of users leveraging AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowAuth(true)}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-2xl shadow-purple-500/30"
              >
                Get Started Now
              </button>
              <button className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 flex items-center gap-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-bold text-white">socialmonitor.io</span>
              </div>
              <p className="text-slate-400 text-sm">
                Real-time social media monitoring and AI-powered analytics platform
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 Social Monitor. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  );
}
