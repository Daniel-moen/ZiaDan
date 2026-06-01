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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4 }}
      className="glass rounded-3xl p-6 md:p-8 w-full max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-heart-beat">✈️</span>
          <div>
            <div className="font-display text-2xl md:text-3xl text-white">
              {label}
            </div>
            <div className="text-white/60 text-sm font-serif italic">
              {startLabel} &rarr; {endLabel}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/55">
            {!mounted
              ? 'Window'
              : beforeWindow
              ? 'Window opens in'
              : inWindow
              ? 'Window closes in'
              : 'Window closed'}
          </div>
          <div className="font-display text-xl text-rose-glow">
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
      <div className="mt-6">
        <div className="relative h-2.5 rounded-full overflow-hidden bg-white/8 border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(!mounted || beforeWindow ? 0 : progress) * 100}%`,
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, #ff8fb1 0%, #c1184c 60%, #a855f7 100%)',
              boxShadow: '0 0 22px rgba(255,143,177,0.6)',
            }}
          />
          {/* Plane marker */}
          {mounted && !beforeWindow && !afterWindow && (
            <motion.div
              initial={{ left: '0%' }}
              animate={{ left: `${progress * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute -top-3 -translate-x-1/2"
              style={{ textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
            >
              ✈️
            </motion.div>
          )}
        </div>
        <div className="flex justify-between mt-2 text-[11px] uppercase tracking-[0.25em] text-white/55">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      </div>

      {/* Mini countdown */}
      <div className="mt-6 flex justify-center">
        <Countdown
          target={targetIso}
          size="sm"
          reachedText={afterWindow ? 'Window has closed' : undefined}
        />
      </div>
    </motion.div>
  );
}
