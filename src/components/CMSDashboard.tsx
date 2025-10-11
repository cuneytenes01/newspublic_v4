import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  ExternalLink,
  Search,
  FileText,
  Image,
  BarChart2,
  Link as LinkIcon,
  CheckCircle,
  Globe
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const trafficData = [
  { month: 'January', current: 120, previous: 100 },
  { month: 'February', current: 180, previous: 140 },
  { month: 'March', current: 240, previous: 200 },
  { month: 'April', current: 200, previous: 220 },
  { month: 'May', current: 220, previous: 180 },
  { month: 'June', current: 280, previous: 240 },
  { month: 'July', current: 260, previous: 220 }
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
  icon: React.ReactNode;
  chartData: number[];
}

function StatCard({ title, value, change, trend, color, icon, chartData }: StatCardProps) {
  const colorClasses = {
    purple: 'from-purple-500 to-blue-500',
    blue: 'from-blue-500 to-cyan-500',
    yellow: 'from-yellow-400 to-orange-500',
    red: 'from-red-400 to-pink-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">{change}</span>
        </div>
        <div className="h-8 flex items-end gap-1">
          {chartData.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-white/40 rounded-full"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CMSDashboard() {
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('month');

  const stats = [
    {
      title: 'Income',
      value: '26K',
      change: '(+12.4%)',
      trend: 'up' as const,
      color: 'purple',
      icon: <Users className="w-6 h-6" />,
      chartData: [60, 80, 70, 90, 100, 85, 95]
    },
    {
      title: 'Users',
      value: '$6,200',
      change: '(+0.9%)',
      trend: 'up' as const,
      color: 'blue',
      icon: <DollarSign className="w-6 h-6" />,
      chartData: [50, 70, 60, 85, 75, 90, 95]
    },
    {
      title: 'Expenses',
      value: '2.49%',
      change: '(-0.7%)',
      trend: 'down' as const,
      color: 'yellow',
      icon: <ShoppingCart className="w-6 h-6" />,
      chartData: [80, 70, 85, 60, 75, 70, 65]
    },
    {
      title: 'Orders',
      value: '44K',
      change: '(+2.1%)',
      trend: 'up' as const,
      color: 'red',
      icon: <Activity className="w-6 h-6" />,
      chartData: [60, 75, 70, 80, 85, 90, 95]
    }
  ];

  const metrics = [
    { label: 'Visits', value: '29,193 Users', percentage: '(40%)' },
    { label: 'Unique', value: '24,093 Users', percentage: '(20%)' },
    { label: 'Pageviews', value: '78,706 Views', percentage: '(60%)' },
    { label: 'New Users', value: '22,123 Users', percentage: '(80%)' },
    { label: 'Bounce Rate', value: 'Average Rate', percentage: '(40.9%)' }
  ];

  const menuItems = [
    {
      title: 'URL Status Monitoring',
      icon: <ExternalLink className="w-5 h-5" />,
      url: 'https://url-status-checker-9xd6.bolt.host',
      isExternal: true
    },
    {
      title: 'SEO Analysis',
      icon: <Search className="w-5 h-5" />,
      items: [
        { name: 'Meta Tags Check', icon: <FileText className="w-4 h-4" /> },
        { name: 'Keyword Density', icon: <BarChart2 className="w-4 h-4" /> },
        { name: 'Page Speed', icon: <TrendingUp className="w-4 h-4" /> },
        { name: 'Mobile Optimization', icon: <Globe className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Content Management',
      icon: <FileText className="w-5 h-5" />,
      items: [
        { name: 'Content Audit', icon: <CheckCircle className="w-4 h-4" /> },
        { name: 'Duplicate Content', icon: <FileText className="w-4 h-4" /> },
        { name: 'Broken Links', icon: <LinkIcon className="w-4 h-4" /> },
        { name: 'Image Optimization', icon: <Image className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      <aside className="w-64 bg-white border-r border-gray-200 shadow-lg overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Menu</h2>
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.isExternal ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
                  >
                    <span className="text-blue-500 group-hover:text-blue-600">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all cursor-pointer">
                      <span className="text-gray-600">{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.items && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.items.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all w-full text-left"
                          >
                            <span className="text-gray-400">{subItem.icon}</span>
                            <span>{subItem.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Traffic</h2>
              <p className="text-sm text-gray-500">January - July 2023</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('day')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeRange === 'day'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeRange === 'month'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeRange === 'year'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Year
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Current Period"
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#94a3b8', r: 3 }}
                name="Previous Period"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8 pt-6 border-t border-gray-200">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                <p className="text-lg font-bold text-gray-800">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.percentage}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
