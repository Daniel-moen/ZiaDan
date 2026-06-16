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
      <HeartsLayer count={20} />

      {/* Admin button */}
      <div className="absolute top-5 right-5 z-30">
        <Link href="/admin" className="btn-ghost text-[10px] kicker">
          Admin
        </Link>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-16 md:py-24 gap-12 md:gap-16">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 24 }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
          className="text-center max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, letterSpacing: '0.8em' }}
            animate={{ opacity: ready ? 1 : 0, letterSpacing: '0.5em' }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="text-[10px] md:text-xs kicker text-white/70 mb-6 flex items-center justify-center gap-3"
          >
            <span className="hairline w-10 md:w-16" />
            <span>
              {config.hisName}
              <span className="text-rose-glow mx-2 animate-heart-beat inline-block">♥</span>
              {config.herName}
            </span>
            <span className="hairline w-10 md:w-16" />
          </motion.div>

          <h1 className="font-display font-medium text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.02] tracking-tight">
            <span className="shimmer-text">{config.title}</span>
          </h1>

          <p className="mt-6 font-serif italic text-xl md:text-2xl text-white/75">
            {config.subtitle}
          </p>
        </motion.div>

        {/* Primary countdown */}
        <motion.section
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{
            opacity: ready ? 1 : 0,
            y: ready ? 0 : 32,
            scale: ready ? 1 : 0.98,
          }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          className="glass p-6 md:p-12 w-full max-w-5xl mx-auto"
        >
          <div className="flex flex-col items-center gap-7 md:gap-9">
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[10px] md:text-xs kicker text-rose-glow/75" style={{ letterSpacing: '0.45em' }}>
                {config.reunionLabel}
              </div>
              <div className="font-serif italic text-white/80 text-lg md:text-xl min-h-[1.5em]">
                {mounted ? formatLongDate(config.reunionDate) : ''}
              </div>
            </div>

            <div className="hairline w-full max-w-sm" />

            <Countdown
              target={config.reunionDate}
              size="lg"
              reachedText="The wait is over. ♥"
            />

            {config.message && (
              <>
                <div className="hairline w-full max-w-sm opacity-60" />
                <p className="max-w-2xl text-center font-serif italic text-white/85 text-lg md:text-2xl leading-relaxed">
                  <span className="gradient-text">“</span>
                  {config.message}
                  <span className="gradient-text">”</span>
                </p>
              </>
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
          animate={{ opacity: ready ? 0.65 : 0 }}
          transition={{ duration: 1.4, delay: 0.7 }}
          className="text-center text-white/55 text-[10px] kicker"
          style={{ letterSpacing: '0.32em' }}
        >
          Made with{' '}
          <span className="text-rose-glow animate-heart-beat inline-block">♥</span>{' '}
          across every mile
        </motion.footer>
      </div>

      {/* Film grain overlay */}
      <div className="grain" aria-hidden />
    </main>
  );
}
