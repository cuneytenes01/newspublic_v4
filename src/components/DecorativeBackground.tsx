import { useEffect, useState, useMemo, memo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  twinkleSpeed: number;
  animationType: 'twinkle' | 'fast-twinkle' | 'shimmer' | 'pulse-star';
  color: string;
  brightness: number;
}

function DecorativeBackground() {
  const colors = useMemo(() => [
    'rgba(59, 130, 246, 1)',
    'rgba(147, 51, 234, 1)',
    'rgba(14, 165, 233, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(251, 191, 36, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(168, 85, 247, 1)',
    'rgba(255, 255, 255, 1)',
    'rgba(239, 246, 255, 1)',
    'rgba(34, 197, 94, 1)',
  ], []);

  const animationTypes = useMemo(() => [
    'twinkle',
    'fast-twinkle',
    'shimmer',
    'pulse-star',
  ] as const, []);

  const stars = useMemo(() => {
    const leftElems: Star[] = [];
    const middleElems: Star[] = [];
    const rightElems: Star[] = [];

    for (let i = 0; i < 50; i++) {
      const sizeCategory = Math.random();
      let size;
      if (sizeCategory < 0.5) size = Math.random() * 4 + 8;
      else if (sizeCategory < 0.8) size = Math.random() * 4 + 12;
      else size = Math.random() * 4 + 16;

      leftElems.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        delay: Math.random() * 5,
        twinkleSpeed: Math.random() * 2 + 1.5,
        animationType: animationTypes[Math.floor(Math.random() * animationTypes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        brightness: Math.random() * 0.4 + 0.8,
      });
    }

    for (let i = 0; i < 40; i++) {
      const sizeCategory = Math.random();
      let size;
      if (sizeCategory < 0.5) size = Math.random() * 4 + 8;
      else if (sizeCategory < 0.8) size = Math.random() * 4 + 12;
      else size = Math.random() * 4 + 16;

      middleElems.push({
        id: i + 50,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        delay: Math.random() * 5,
        twinkleSpeed: Math.random() * 2 + 1.5,
        animationType: animationTypes[Math.floor(Math.random() * animationTypes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        brightness: Math.random() * 0.4 + 0.8,
      });
    }

    for (let i = 0; i < 60; i++) {
      const sizeCategory = Math.random();
      let size;
      if (sizeCategory < 0.5) size = Math.random() * 4 + 8;
      else if (sizeCategory < 0.8) size = Math.random() * 4 + 12;
      else size = Math.random() * 4 + 16;

      rightElems.push({
        id: i + 90,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        delay: Math.random() * 5,
        twinkleSpeed: Math.random() * 2 + 1.5,
        animationType: animationTypes[Math.floor(Math.random() * animationTypes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        brightness: Math.random() * 0.4 + 0.8,
      });
    }

    return { leftStars: leftElems, middleStars: middleElems, rightStars: rightElems };
  }, [colors, animationTypes]);

  return (
    <>
      <div className="fixed left-[230px] top-0 w-[250px] h-screen pointer-events-none overflow-visible z-0">
        <div className="absolute inset-0">
          {stars.leftStars.map((star) => {
            const baseColor = star.color;
            const rgb = baseColor.match(/\d+/g)?.slice(0, 3).join(', ') || '59, 130, 246';
            return (
              <div
                key={star.id}
                className={`absolute rounded-full animate-${star.animationType}`}
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.twinkleSpeed}s`,
                  background: `radial-gradient(circle, rgba(${rgb}, ${star.brightness}) 0%, rgba(${rgb}, ${star.brightness * 0.8}) 30%, rgba(${rgb}, 0) 70%)`,
                  boxShadow: `0 0 ${star.size * 2}px rgba(${rgb}, ${star.brightness}), 0 0 ${star.size * 4}px rgba(${rgb}, ${star.brightness * 0.6}), 0 0 ${star.size * 6}px rgba(${rgb}, ${star.brightness * 0.3})`,
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              />
            );
          })}

          <div
            className="absolute top-16 left-12 w-8 h-8 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 1) 0%, rgba(147, 51, 234, 0.8) 30%, rgba(147, 51, 234, 0) 70%)',
              boxShadow: '0 0 30px rgba(147, 51, 234, 1), 0 0 60px rgba(147, 51, 234, 0.7), 0 0 90px rgba(147, 51, 234, 0.4)',
              animationDuration: '2s',
            }}
          />
          <div
            className="absolute top-12 left-[75%] w-11 h-11 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 1) 0%, rgba(59, 130, 246, 0.8) 30%, rgba(59, 130, 246, 0) 70%)',
              boxShadow: '0 0 42px rgba(59, 130, 246, 1), 0 0 84px rgba(59, 130, 246, 0.7), 0 0 126px rgba(59, 130, 246, 0.4)',
              animationDuration: '2.3s',
              animationDelay: '0.7s',
            }}
          />
          <div
            className="absolute top-20 left-[80%] w-10 h-10 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 1) 0%, rgba(251, 191, 36, 0.8) 30%, rgba(251, 191, 36, 0) 70%)',
              boxShadow: '0 0 38px rgba(251, 191, 36, 1), 0 0 76px rgba(251, 191, 36, 0.7), 0 0 114px rgba(251, 191, 36, 0.4)',
              animationDuration: '2.6s',
              animationDelay: '1.2s',
            }}
          />
          <div
            className="absolute top-32 left-[70%] w-9 h-9 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 1) 0%, rgba(236, 72, 153, 0.8) 30%, rgba(236, 72, 153, 0) 70%)',
              boxShadow: '0 0 35px rgba(236, 72, 153, 1), 0 0 70px rgba(236, 72, 153, 0.7), 0 0 105px rgba(236, 72, 153, 0.4)',
              animationDuration: '2.8s',
              animationDelay: '0.4s',
            }}
          />
          <div
            className="absolute top-40 left-[85%] w-10 h-10 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(14, 165, 233, 1) 0%, rgba(14, 165, 233, 0.8) 30%, rgba(14, 165, 233, 0) 70%)',
              boxShadow: '0 0 35px rgba(14, 165, 233, 1), 0 0 70px rgba(14, 165, 233, 0.7), 0 0 100px rgba(14, 165, 233, 0.4)',
              animationDuration: '2.5s',
              animationDelay: '0.5s',
            }}
          />
          <div
            className="absolute top-48 left-[78%] w-8 h-8 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 1) 0%, rgba(16, 185, 129, 0.8) 30%, rgba(16, 185, 129, 0) 70%)',
              boxShadow: '0 0 32px rgba(16, 185, 129, 1), 0 0 64px rgba(16, 185, 129, 0.7), 0 0 96px rgba(16, 185, 129, 0.4)',
              animationDuration: '2.7s',
              animationDelay: '1.5s',
            }}
          />
          <div
            className="absolute top-56 left-[82%] w-10 h-10 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 1) 0%, rgba(168, 85, 247, 0.8) 30%, rgba(168, 85, 247, 0) 70%)',
              boxShadow: '0 0 38px rgba(168, 85, 247, 1), 0 0 76px rgba(168, 85, 247, 0.7), 0 0 114px rgba(168, 85, 247, 0.4)',
              animationDuration: '2.4s',
              animationDelay: '0.9s',
            }}
          />
          <div
            className="absolute top-1/2 left-20 w-7 h-7 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 1) 0%, rgba(236, 72, 153, 0.8) 30%, rgba(236, 72, 153, 0) 70%)',
              boxShadow: '0 0 30px rgba(236, 72, 153, 1), 0 0 60px rgba(236, 72, 153, 0.7), 0 0 90px rgba(236, 72, 153, 0.4)',
              animationDuration: '3s',
              animationDelay: '1s',
            }}
          />
          <div
            className="absolute bottom-32 left-24 w-9 h-9 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 1) 0%, rgba(251, 191, 36, 0.8) 30%, rgba(251, 191, 36, 0) 70%)',
              boxShadow: '0 0 35px rgba(251, 191, 36, 1), 0 0 70px rgba(251, 191, 36, 0.7), 0 0 100px rgba(251, 191, 36, 0.4)',
              animationDuration: '2.2s',
              animationDelay: '0.8s',
            }}
          />
          <div
            className="absolute bottom-56 left-8 w-6 h-6 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 1) 0%, rgba(16, 185, 129, 0.8) 30%, rgba(16, 185, 129, 0) 70%)',
              boxShadow: '0 0 25px rgba(16, 185, 129, 1), 0 0 50px rgba(16, 185, 129, 0.7), 0 0 75px rgba(16, 185, 129, 0.4)',
              animationDuration: '2.7s',
              animationDelay: '0.3s',
            }}
          />
          <div
            className="absolute top-24 left-16 w-9 h-9 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 1) 0%, rgba(59, 130, 246, 0.8) 30%, rgba(59, 130, 246, 0) 70%)',
              boxShadow: '0 0 35px rgba(59, 130, 246, 1), 0 0 70px rgba(59, 130, 246, 0.7), 0 0 100px rgba(59, 130, 246, 0.4)',
              animationDuration: '2.6s',
              animationDelay: '1.3s',
            }}
          />
          <div
            className="absolute top-64 left-28 w-8 h-8 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 1) 0%, rgba(168, 85, 247, 0.8) 30%, rgba(168, 85, 247, 0) 70%)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 1), 0 0 60px rgba(168, 85, 247, 0.7), 0 0 90px rgba(168, 85, 247, 0.4)',
              animationDuration: '2.9s',
              animationDelay: '0.2s',
            }}
          />
          <div
            className="absolute bottom-44 left-36 w-7 h-7 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 1) 0%, rgba(236, 72, 153, 0.8) 30%, rgba(236, 72, 153, 0) 70%)',
              boxShadow: '0 0 28px rgba(236, 72, 153, 1), 0 0 56px rgba(236, 72, 153, 0.7), 0 0 84px rgba(236, 72, 153, 0.4)',
              animationDuration: '2.4s',
              animationDelay: '1.7s',
            }}
          />
          <div
            className="absolute top-80 left-12 w-10 h-10 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0.8) 30%, rgba(34, 197, 94, 0) 70%)',
              boxShadow: '0 0 36px rgba(34, 197, 94, 1), 0 0 72px rgba(34, 197, 94, 0.7), 0 0 108px rgba(34, 197, 94, 0.4)',
              animationDuration: '2.1s',
              animationDelay: '0.9s',
            }}
          />
          <div
            className="absolute bottom-20 left-20 w-8 h-8 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(251, 146, 60, 1) 0%, rgba(251, 146, 60, 0.8) 30%, rgba(251, 146, 60, 0) 70%)',
              boxShadow: '0 0 32px rgba(251, 146, 60, 1), 0 0 64px rgba(251, 146, 60, 0.7), 0 0 96px rgba(251, 146, 60, 0.4)',
              animationDuration: '2.8s',
              animationDelay: '0.6s',
            }}
          />

          <div className="absolute top-32 left-16 w-64 h-64 bg-gradient-to-br from-blue-500/15 to-cyan-500/8 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-48 left-12 w-72 h-72 bg-gradient-to-br from-purple-500/12 to-pink-500/8 rounded-full blur-3xl animate-pulse-slower"></div>
        </div>
      </div>

      <div className="fixed left-[480px] top-0 w-[280px] h-screen pointer-events-none overflow-visible z-0">
        <div className="absolute inset-0">
          {stars.middleStars.map((star) => {
            const baseColor = star.color;
            const rgb = baseColor.match(/\d+/g)?.slice(0, 3).join(', ') || '59, 130, 246';
            return (
              <div
                key={star.id}
                className={`absolute rounded-full animate-${star.animationType}`}
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.twinkleSpeed}s`,
                  background: `radial-gradient(circle, rgba(${rgb}, ${star.brightness}) 0%, rgba(${rgb}, ${star.brightness * 0.8}) 30%, rgba(${rgb}, 0) 70%)`,
                  boxShadow: `0 0 ${star.size * 2}px rgba(${rgb}, ${star.brightness}), 0 0 ${star.size * 4}px rgba(${rgb}, ${star.brightness * 0.6}), 0 0 ${star.size * 6}px rgba(${rgb}, ${star.brightness * 0.3})`,
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="fixed right-0 top-0 w-[35vw] h-screen pointer-events-none overflow-visible z-0">
        <div className="absolute inset-0">
          {stars.rightStars.map((star) => {
            const baseColor = star.color;
            const rgb = baseColor.match(/\d+/g)?.slice(0, 3).join(', ') || '59, 130, 246';
            return (
              <div
                key={star.id}
                className={`absolute rounded-full animate-${star.animationType}`}
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.twinkleSpeed}s`,
                  background: `radial-gradient(circle, rgba(${rgb}, ${star.brightness}) 0%, rgba(${rgb}, ${star.brightness * 0.8}) 30%, rgba(${rgb}, 0) 70%)`,
                  boxShadow: `0 0 ${star.size * 2}px rgba(${rgb}, ${star.brightness}), 0 0 ${star.size * 4}px rgba(${rgb}, ${star.brightness * 0.6}), 0 0 ${star.size * 6}px rgba(${rgb}, ${star.brightness * 0.3})`,
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              />
            );
          })}

          <div
            className="absolute top-20 right-20 w-12 h-12 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 1) 0%, rgba(147, 51, 234, 0.8) 30%, rgba(147, 51, 234, 0) 70%)',
              boxShadow: '0 0 40px rgba(147, 51, 234, 1), 0 0 80px rgba(147, 51, 234, 0.7), 0 0 120px rgba(147, 51, 234, 0.4)',
              animationDuration: '2.3s',
            }}
          />
          <div
            className="absolute top-48 right-40 w-10 h-10 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(14, 165, 233, 1) 0%, rgba(14, 165, 233, 0.8) 30%, rgba(14, 165, 233, 0) 70%)',
              boxShadow: '0 0 35px rgba(14, 165, 233, 1), 0 0 70px rgba(14, 165, 233, 0.7), 0 0 105px rgba(14, 165, 233, 0.4)',
              animationDuration: '2.8s',
              animationDelay: '0.3s',
            }}
          />
          <div
            className="absolute top-72 right-24 w-8 h-8 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 1) 0%, rgba(236, 72, 153, 0.8) 30%, rgba(236, 72, 153, 0) 70%)',
              boxShadow: '0 0 30px rgba(236, 72, 153, 1), 0 0 60px rgba(236, 72, 153, 0.7), 0 0 90px rgba(236, 72, 153, 0.4)',
              animationDuration: '3.2s',
              animationDelay: '0.7s',
            }}
          />
          <div
            className="absolute bottom-1/3 right-32 w-11 h-11 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 1) 0%, rgba(251, 191, 36, 0.8) 30%, rgba(251, 191, 36, 0) 70%)',
              boxShadow: '0 0 40px rgba(251, 191, 36, 1), 0 0 80px rgba(251, 191, 36, 0.7), 0 0 120px rgba(251, 191, 36, 0.4)',
              animationDuration: '2.5s',
              animationDelay: '1.2s',
            }}
          />
          <div
            className="absolute bottom-48 right-48 w-9 h-9 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 1) 0%, rgba(16, 185, 129, 0.8) 30%, rgba(16, 185, 129, 0) 70%)',
              boxShadow: '0 0 35px rgba(16, 185, 129, 1), 0 0 70px rgba(16, 185, 129, 0.7), 0 0 105px rgba(16, 185, 129, 0.4)',
              animationDuration: '2.7s',
              animationDelay: '0.5s',
            }}
          />
          <div
            className="absolute bottom-24 right-16 w-7 h-7 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 1) 0%, rgba(239, 68, 68, 0.8) 30%, rgba(239, 68, 68, 0) 70%)',
              boxShadow: '0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.7), 0 0 90px rgba(239, 68, 68, 0.4)',
              animationDuration: '2.4s',
              animationDelay: '1.5s',
            }}
          />
          <div
            className="absolute top-36 right-28 w-10 h-10 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 1) 0%, rgba(59, 130, 246, 0.8) 30%, rgba(59, 130, 246, 0) 70%)',
              boxShadow: '0 0 38px rgba(59, 130, 246, 1), 0 0 76px rgba(59, 130, 246, 0.7), 0 0 114px rgba(59, 130, 246, 0.4)',
              animationDuration: '2.6s',
              animationDelay: '1.8s',
            }}
          />
          <div
            className="absolute top-60 right-16 w-9 h-9 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 1) 0%, rgba(168, 85, 247, 0.8) 30%, rgba(168, 85, 247, 0) 70%)',
              boxShadow: '0 0 34px rgba(168, 85, 247, 1), 0 0 68px rgba(168, 85, 247, 0.7), 0 0 102px rgba(168, 85, 247, 0.4)',
              animationDuration: '2.9s',
              animationDelay: '0.4s',
            }}
          />
          <div
            className="absolute top-96 right-36 w-11 h-11 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 1) 0%, rgba(236, 72, 153, 0.8) 30%, rgba(236, 72, 153, 0) 70%)',
              boxShadow: '0 0 40px rgba(236, 72, 153, 1), 0 0 80px rgba(236, 72, 153, 0.7), 0 0 120px rgba(236, 72, 153, 0.4)',
              animationDuration: '2.3s',
              animationDelay: '1.1s',
            }}
          />
          <div
            className="absolute bottom-64 right-20 w-10 h-10 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0.8) 30%, rgba(34, 197, 94, 0) 70%)',
              boxShadow: '0 0 38px rgba(34, 197, 94, 1), 0 0 76px rgba(34, 197, 94, 0.7), 0 0 114px rgba(34, 197, 94, 0.4)',
              animationDuration: '2.5s',
              animationDelay: '0.7s',
            }}
          />
          <div
            className="absolute bottom-36 right-44 w-8 h-8 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(251, 146, 60, 1) 0%, rgba(251, 146, 60, 0.8) 30%, rgba(251, 146, 60, 0) 70%)',
              boxShadow: '0 0 32px rgba(251, 146, 60, 1), 0 0 64px rgba(251, 146, 60, 0.7), 0 0 96px rgba(251, 146, 60, 0.4)',
              animationDuration: '2.7s',
              animationDelay: '1.4s',
            }}
          />
          <div
            className="absolute top-1/4 right-52 w-9 h-9 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(14, 165, 233, 1) 0%, rgba(14, 165, 233, 0.8) 30%, rgba(14, 165, 233, 0) 70%)',
              boxShadow: '0 0 35px rgba(14, 165, 233, 1), 0 0 70px rgba(14, 165, 233, 0.7), 0 0 105px rgba(14, 165, 233, 0.4)',
              animationDuration: '2.4s',
              animationDelay: '0.9s',
            }}
          />
          <div
            className="absolute bottom-1/4 right-24 w-10 h-10 rounded-full animate-twinkle"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 1) 0%, rgba(251, 191, 36, 0.8) 30%, rgba(251, 191, 36, 0) 70%)',
              boxShadow: '0 0 38px rgba(251, 191, 36, 1), 0 0 76px rgba(251, 191, 36, 0.7), 0 0 114px rgba(251, 191, 36, 0.4)',
              animationDuration: '2.6s',
              animationDelay: '0.2s',
            }}
          />

          <div className="absolute top-24 right-20 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-cyan-500/8 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-40 right-32 w-96 h-96 bg-gradient-to-br from-purple-500/12 to-pink-500/8 rounded-full blur-3xl animate-pulse-slower"></div>
          <div className="absolute top-1/3 right-16 w-72 h-72 bg-gradient-to-br from-emerald-500/12 to-teal-500/8 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>
    </>
  );
}

export default memo(DecorativeBackground);
