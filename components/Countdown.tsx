'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Fragment } from 'react';
import { diffToParts } from '@/lib/config';
import { useTick } from '@/lib/useTick';
import { useMounted } from '@/lib/useMounted';

type Size = 'lg' | 'md' | 'sm';

function Digit({ value, size = 'lg' }: { value: number | string; size?: Size }) {
  const padded = typeof value === 'number' ? String(value).padStart(2, '0') : value;
  const sizes: Record<Size, string> = {
    lg: 'text-6xl md:text-8xl lg:text-9xl',
    md: 'text-4xl md:text-5xl',
    sm: 'text-3xl md:text-4xl',
  };
  return (
    <div
      className={`relative overflow-hidden inline-flex justify-center ${sizes[size]}`}
      style={{ minWidth: '1.7ch' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={padded}
          initial={{ y: '60%', opacity: 0, filter: 'blur(10px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-60%', opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="font-display font-medium tabular-nums shimmer-text"
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
      ? 'px-4 py-5 md:px-8 md:py-7 min-w-[5.5rem] md:min-w-[9.5rem]'
      : size === 'md'
      ? 'px-3 py-3 min-w-[5rem]'
      : 'px-3 py-3 min-w-[4.25rem]';

  const labelSize =
    size === 'lg' ? 'text-[10px] md:text-xs' : 'text-[9px] md:text-[10px]';

  return (
    <div className={`digit-tile ${tile} flex flex-col items-center`}>
      <Digit value={value} size={size} />
      <div
        className={`mt-2.5 ${labelSize} kicker text-rose-glow/80`}
        style={{ letterSpacing: '0.32em' }}
      >
        {label}
      </div>
    </div>
  );
}

function Separator({ size }: { size: Size }) {
  const cls =
    size === 'lg'
      ? 'text-4xl md:text-6xl'
      : size === 'md'
      ? 'text-2xl'
      : 'text-xl';
  return (
    <span
      className={`separator font-display ${cls} self-center pb-6 animate-sep-blink select-none`}
      aria-hidden
    >
      :
    </span>
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

  const skeleton = { days: '--', hours: '--', minutes: '--', seconds: '--' };
  const parts = mounted ? diffToParts(target, now) : null;

  if (parts && parts.isPast && reachedText) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="font-display italic text-3xl md:text-5xl shimmer-text text-center"
      >
        {reachedText}
      </motion.div>
    );
  }

  const units: { value: number | string; label: string }[] = [
    { value: parts ? parts.days : skeleton.days, label: 'Days' },
    { value: parts ? parts.hours : skeleton.hours, label: 'Hours' },
    { value: parts ? parts.minutes : skeleton.minutes, label: 'Minutes' },
    { value: parts ? parts.seconds : skeleton.seconds, label: 'Seconds' },
  ];

  return (
    <div className="flex flex-wrap items-stretch justify-center gap-2 md:gap-3">
      {units.map((u, i) => (
        <Fragment key={u.label}>
          <Unit value={u.value} label={u.label} size={size} />
          {i < units.length - 1 && <Separator size={size} />}
        </Fragment>
      ))}
    </div>
  );
}
