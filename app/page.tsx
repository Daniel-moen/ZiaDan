'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import BackgroundCarousel from '@/components/BackgroundCarousel';
import HeartsLayer from '@/components/HeartsLayer';
import Countdown from '@/components/Countdown';
import FlybyWindow from '@/components/FlybyWindow';
import { useConfig } from '@/lib/useConfig';
import { useMounted } from '@/lib/useMounted';
import { formatLongDate } from '@/lib/config';

export default function HomePage() {
  const [config, ready] = useConfig();
  const mounted = useMounted();

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      <BackgroundCarousel
        images={config.backgroundImages}
        intervalMs={config.backgroundIntervalMs}
      />
      <HeartsLayer count={16} />

      {/* Admin button */}
      <div className="absolute top-5 right-5 z-30">
        <Link
          href="/admin"
          className="btn-ghost text-xs uppercase tracking-[0.3em]"
        >
          Admin
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center px-5 py-14 md:py-24 gap-10 md:gap-14">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center max-w-4xl"
        >
          <div className="text-[11px] md:text-xs uppercase tracking-[0.5em] text-white/70 mb-4 font-medium">
            {config.hisName}{' '}
            <span className="text-rose-glow animate-pulse-soft">♥</span>{' '}
            {config.herName}
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] shimmer-text">
            {config.title}
          </h1>
          <p className="mt-5 font-serif italic text-lg md:text-2xl text-white/80">
            {config.subtitle}
          </p>
        </motion.div>

        {/* Primary countdown */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 24 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="glass rounded-[2rem] p-6 md:p-10 w-full max-w-5xl mx-auto"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-white/65">
                {config.reunionLabel}
              </div>
              <div className="font-serif italic text-white/85 text-lg md:text-xl min-h-[1.5em]">
                {mounted ? formatLongDate(config.reunionDate) : ''}
              </div>
            </div>

            <div className="hairline w-full max-w-md" />

            <Countdown
              target={config.reunionDate}
              size="lg"
              reachedText="The wait is over. ♥"
            />

            {config.message && (
              <p className="mt-2 max-w-2xl text-center font-serif italic text-white/85 text-lg md:text-xl leading-relaxed">
                “{config.message}”
              </p>
            )}
          </div>
        </motion.section>

        {/* Flyby window */}
        {config.flybyEnabled && (
          <FlybyWindow
            label={config.flybyLabel}
            startIso={config.flybyStart}
            endIso={config.flybyEnd}
          />
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 0.7 : 0 }}
          transition={{ duration: 1.4, delay: 0.6 }}
          className="text-center text-white/60 text-xs tracking-[0.3em] uppercase mt-4"
        >
          Made with{' '}
          <span className="text-rose-glow animate-heart-beat inline-block">♥</span>{' '}
          across every mile
        </motion.footer>
      </div>
    </main>
  );
}
