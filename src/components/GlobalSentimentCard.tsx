import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

interface SentimentDot {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  angle: number;
}

export default function GlobalSentimentCard() {
  const [dots, setDots] = useState<SentimentDot[]>([]);

  useEffect(() => {
    const initialDots: SentimentDot[] = [
      { id: 1, x: 50, y: 30, color: 'bg-green-500', size: 8, speed: 0.3, angle: 45 },
      { id: 2, x: 30, y: 50, color: 'bg-green-400', size: 6, speed: 0.25, angle: 120 },
      { id: 3, x: 70, y: 40, color: 'bg-yellow-400', size: 5, speed: 0.2, angle: 200 },
      { id: 4, x: 65, y: 65, color: 'bg-yellow-500', size: 6, speed: 0.35, angle: 300 },
      { id: 5, x: 35, y: 70, color: 'bg-red-400', size: 5, speed: 0.28, angle: 90 },
    ];
    setDots(initialDots);

    const interval = setInterval(() => {
      setDots(prevDots =>
        prevDots.map(dot => {
          const centerX = 50;
          const centerY = 50;
          const distance = 25;

          const newAngle = (dot.angle + dot.speed) % 360;
          const radians = (newAngle * Math.PI) / 180;

          const newX = centerX + Math.cos(radians) * distance;
          const newY = centerY + Math.sin(radians) * distance;

          return {
            ...dot,
            x: newX,
            y: newY,
            angle: newAngle,
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-blue-500/30 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-400" />
          <h3 className="text-2xl font-bold text-white">Global Sentiment</h3>
        </div>
        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium animate-pulse">
          LIVE
        </span>
      </div>

      <div className="relative h-64 flex items-center justify-center">
        <div className="absolute w-48 h-48 border-2 border-blue-500/20 rounded-full animate-pulse"></div>
        <div className="absolute w-32 h-32 border-2 border-blue-500/30 rounded-full"></div>

        {dots.map(dot => (
          <div
            key={dot.id}
            className={`absolute ${dot.color} rounded-full transition-all duration-100 ease-linear`}
            style={{
              width: `${dot.size * 4}px`,
              height: `${dot.size * 4}px`,
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: dot.color.includes('green')
                ? '0 0 20px rgba(34, 197, 94, 0.6)'
                : dot.color.includes('yellow')
                ? '0 0 15px rgba(234, 179, 8, 0.5)'
                : '0 0 12px rgba(248, 113, 113, 0.5)',
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-slate-400 text-sm">Positive (70%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-slate-400 text-sm">Neutral (50-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-slate-400 text-sm">Negative (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
}
