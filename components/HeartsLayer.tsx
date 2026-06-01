'use client';

import { useMemo } from 'react';
import { useMounted } from '@/lib/useMounted';

// Deterministic pseudo-random; we still gate the render on `mounted`
// because React's SSR vs. client style-number serialization can differ.
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

export default function HeartsLayer({ count = 14 }: { count?: number }) {
  const mounted = useMounted();

  const hearts = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const left = seeded(i, 1) * 100;
      const top = seeded(i, 2) * 100;
      const size = 12 + seeded(i, 3) * 26;
      const delay = seeded(i, 4) * 8;
      const duration = 10 + seeded(i, 5) * 12;
      const opacity = 0.18 + seeded(i, 6) * 0.5;
      return { left, top, size, delay, duration, opacity, i };
    });
  }, [count]);

  // Render nothing on the server so React can hydrate cleanly, then
  // the hearts appear on the client after mount.
  if (!mounted) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.i}
          className="heart animate-float-slow"
          style={{
            left: `${h.left}%`,
            top: `${h.top}%`,
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
