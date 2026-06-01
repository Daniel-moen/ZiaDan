'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { diffToParts } from '@/lib/config';
import { useTick } from '@/lib/useTick';
import { useMounted } from '@/lib/useMounted';

type Size = 'lg' | 'md' | 'sm';

function Digit({ value, size = 'lg' }: { value: number | string; size?: Size }) {
  const padded = typeof value === 'number' ? String(value).padStart(2, '0') : value;
  const sizes: Record<Size, string> = {
    lg: 'text-7xl md:text-8xl lg:text-9xl',
    md: 'text-4xl md:text-5xl',
    sm: 'text-2xl md:text-3xl',
  };
  return (
    <div
      className={`relative overflow-hidden inline-flex justify-center ${sizes[size]}`}
      style={{ minWidth: '1.6ch' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={padded}
          initial={{ y: '50%', opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-50%', opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
          className="font-display font-semibold tabular-nums shimmer-text"
        >
          {padded}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Unit({
  value,
  label,
  size = 'lg',
}: {
  value: number | string;
  label: string;
  size?: Size;
}) {
  const tile =
    size === 'lg'
      ? 'px-5 py-6 md:px-8 md:py-8 min-w-[7rem] md:min-w-[10rem]'
      : size === 'md'
      ? 'px-3 py-3 min-w-[5rem]'
      : 'px-2 py-2 min-w-[3.5rem]';

  const labelSize =
    size === 'lg' ? 'text-xs md:text-sm' : size === 'md' ? 'text-[10px]' : 'text-[10px]';

  return (
    <div className={`digit-tile ${tile} flex flex-col items-center`}>
      <Digit value={value} size={size} />
      <div
        className={`mt-2 ${labelSize} uppercase tracking-[0.35em] text-white/65`}
      >
        {label}
      </div>
    </div>
  );
}

type Props = {
  target: string; // ISO
  size?: Size;
  reachedText?: string;
};

export default function Countdown({ target, size = 'lg', reachedText }: Props) {
  const mounted = useMounted();
  const now = useTick(1000);

  // Before mount, render a stable skeleton so SSR + first-client render
  // produce identical HTML (no time-based mismatch on hydration).
  if (!mounted) {
    return (
      <div className="flex flex-wrap items-stretch justify-center gap-3 md:gap-5">
        <Unit value="--" label="Days" size={size} />
        <Unit value="--" label="Hours" size={size} />
        <Unit value="--" label="Minutes" size={size} />
        <Unit value="--" label="Seconds" size={size} />
      </div>
    );
  }

  const parts = diffToParts(target, now);

  if (parts.isPast && reachedText) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="font-display text-3xl md:text-5xl shimmer-text text-center"
      >
        {reachedText}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-wrap items-stretch justify-center gap-3 md:gap-5">
      <Unit value={parts.days} label="Days" size={size} />
      <Unit value={parts.hours} label="Hours" size={size} />
      <Unit value={parts.minutes} label="Minutes" size={size} />
      <Unit value={parts.seconds} label="Seconds" size={size} />
    </div>
  );
}
