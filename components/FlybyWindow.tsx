'use client';

import { motion } from 'framer-motion';
import { diffToParts, formatShortDate } from '@/lib/config';
import { useTick } from '@/lib/useTick';
import { useMounted } from '@/lib/useMounted';
import Countdown from './Countdown';

type Props = {
  label: string;
  startIso: string;
  endIso: string;
};

export default function FlybyWindow({ label, startIso, endIso }: Props) {
  const mounted = useMounted();
  const now = useTick(1000);
  const startMs = new Date(startIso).getTime();
  const endMs = new Date(endIso).getTime();
  const nowMs = now.getTime();

  const beforeWindow = nowMs < startMs;
  const inWindow = nowMs >= startMs && nowMs <= endMs;
  const afterWindow = nowMs > endMs;

  // Progress through window
  const span = Math.max(1, endMs - startMs);
  const progress = Math.max(0, Math.min(1, (nowMs - startMs) / span));

  // Best countdown to show
  const targetIso = beforeWindow ? startIso : inWindow ? endIso : endIso;
  const parts = diffToParts(targetIso, now);

  // Locale-formatted dates differ between server and client environments;
  // only render them after mount so hydration matches.
  const startLabel = mounted ? formatShortDate(startIso) : '';
  const endLabel = mounted ? formatShortDate(endIso) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4 }}
      className="glass-soft rounded-3xl p-6 md:p-8 w-full max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="text-2xl md:text-3xl animate-heart-beat drop-shadow-[0_4px_14px_rgba(255,143,176,0.6)]">
            ✈️
          </span>
          <div>
            <div className="text-[10px] kicker text-rose-glow/70 mb-1" style={{ letterSpacing: '0.4em' }}>
              {label}
            </div>
            <div className="text-white/65 text-sm font-serif italic">
              {startLabel} &rarr; {endLabel}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] kicker text-white/45" style={{ letterSpacing: '0.3em' }}>
            {!mounted
              ? 'Window'
              : beforeWindow
              ? 'Opens in'
              : inWindow
              ? 'Closes in'
              : 'Window closed'}
          </div>
          <div className="font-display text-xl md:text-2xl gradient-text">
            {!mounted
              ? '—'
              : parts.isPast && afterWindow
              ? '—'
              : `${parts.days}d ${String(parts.hours).padStart(2, '0')}h ${String(
                  parts.minutes,
                ).padStart(2, '0')}m`}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-7">
        <div className="relative h-2 rounded-full overflow-hidden bg-white/[0.07] border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(!mounted || beforeWindow ? 0 : progress) * 100}%`,
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, #ffcf9e 0%, #ff8fb0 50%, #e0436b 100%)',
              boxShadow: '0 0 22px rgba(255,143,176,0.7)',
            }}
          />
          {/* Plane marker */}
          {mounted && !beforeWindow && !afterWindow && (
            <motion.div
              initial={{ left: '0%' }}
              animate={{ left: `${progress * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute -top-3 -translate-x-1/2 text-sm"
              style={{ textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
            >
              ✈️
            </motion.div>
          )}
        </div>
        <div className="flex justify-between mt-2.5 text-[10px] kicker text-white/45" style={{ letterSpacing: '0.22em' }}>
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      </div>

      {/* Mini countdown */}
      <div className="mt-7 flex justify-center">
        <Countdown
          target={targetIso}
          size="sm"
          reachedText={afterWindow ? 'Window has closed' : undefined}
        />
      </div>
    </motion.div>
  );
}
