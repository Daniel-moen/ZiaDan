'use client';

import { useMemo } from 'react';
import { useMounted } from '@/lib/useMounted';

// Deterministic pseudo-random; we still gate the render on `mounted`
// because React's SSR vs. client style-number serialization can differ.
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

export default function HeartsLayer({ count = 18 }: { count?: number }) {
  const mounted = useMounted();

  const motes = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const left = seeded(i, 1) * 100;
      const top = seeded(i, 2) * 100;
      const delay = seeded(i, 4) * 10;
      const duration = 12 + seeded(i, 5) * 14;
      // ~1 in 3 are hearts; the rest are tiny glowing light motes
      const isHeart = seeded(i, 7) > 0.62;
      const size = isHeart ? 12 + seeded(i, 3) * 22 : 3 + seeded(i, 3) * 5;
      const opacity = isHeart ? 0.2 + seeded(i, 6) * 0.4 : 0.3 + seeded(i, 6) * 0.5;
      return { left, top, size, delay, duration, opacity, isHeart, i };
    });
  }, [count]);

  // Render nothing on the server so React can hydrate cleanly, then
  // the motes appear on the client after mount.
  if (!mounted) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {motes.map((m) => (
        <span
          key={m.i}
          className={`mote ${m.isHeart ? 'mote-heart' : 'mote-spark'} ${
            m.i % 2 === 0 ? 'animate-float-slow' : 'animate-float-slower'
          }`}
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            fontSize: m.isHeart ? `${m.size}px` : undefined,
            width: m.isHeart ? undefined : `${m.size}px`,
            height: m.isHeart ? undefined : `${m.size}px`,
            opacity: m.opacity,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
          }}
        >
          {m.isHeart ? '♥' : ''}
        </span>
      ))}
    </div>
  );
}
