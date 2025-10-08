import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
}

export default function ViralRadarCard() {
  const [progress, setProgress] = useState(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

  useEffect(() => {
    const points: DataPoint[] = [
      { x: 50, y: 100 },
      { x: 80, y: 85 },
      { x: 120, y: 80 },
      { x: 150, y: 75 },
      { x: 180, y: 65 },
      { x: 210, y: 55 },
      { x: 250, y: 50 },
    ];
    setDataPoints(points);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const visiblePoints = Math.floor((dataPoints.length * progress) / 100);

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-purple-500/30 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">Viral Radar</h3>
        </div>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-medium">
          Next 6 Hours
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded-full font-medium animate-pulse">
            PREDICTING
          </span>
        </div>
        <div className="text-slate-300 font-medium">Next 6 Hours:</div>
        <div className="text-2xl font-bold text-white">AI Revolution</div>
      </div>

      <div className="relative h-48 bg-slate-950/50 rounded-xl p-6 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
            </linearGradient>
          </defs>

          {visiblePoints > 1 &&
            dataPoints.slice(0, visiblePoints).map((point, index) => {
              if (index === 0) return null;
              const prevPoint = dataPoints[index - 1];
              return (
                <line
                  key={`line-${index}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={point.x}
                  y2={point.y}
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              );
            })}

          {dataPoints.slice(0, visiblePoints).map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r={index === visiblePoints - 1 ? 6 : 4}
              fill={index === visiblePoints - 1 ? '#10b981' : '#3b82f6'}
              opacity={index === visiblePoints - 1 ? 1 : 0.5}
              className={index === visiblePoints - 1 ? 'animate-pulse' : ''}
            >
              {index === visiblePoints - 1 && (
                <animate
                  attributeName="r"
                  values="6;8;6"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}
        </svg>

        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-green-500/10 to-transparent"
            style={{
              width: '100px',
              left: `${progress}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.05s linear',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-slate-400 text-sm">High Viral (85%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-slate-400 text-sm">Medium (70-85%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-slate-400 text-sm">Low (&lt;70%)</span>
        </div>
      </div>
    </div>
  );
}
