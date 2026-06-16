'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Props = {
  images: string[];
  intervalMs?: number;
};

export default function BackgroundCarousel({ images, intervalMs = 9000 }: Props) {
  const safeImages = images && images.length > 0 ? images : [''];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((currentIndex) => getRandomNextIndex(currentIndex, safeImages.length));
    }, intervalMs);
    return () => clearInterval(id);
  }, [safeImages.length, intervalMs]);

  // Reset when image list changes
  useEffect(() => {
    setIndex(0);
  }, [images.join('|')]);

  const current = safeImages[index];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence>
        {current ? (
          <motion.div
            key={current + index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* blurred fill behind, so portrait shots never letterbox awkwardly */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl opacity-60"
              style={{
                backgroundImage: `url(${JSON.stringify(current)})`,
                filter: 'brightness(70%) saturate(120%)',
              }}
            />
            <div
              className="background-carousel-image absolute inset-0 animate-kenburns"
              style={{
                backgroundImage: `url(${JSON.stringify(current)})`,
                filter: 'brightness(82%) saturate(118%) contrast(106%)',
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Animated aurora atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="aurora-blob animate-aurora-1"
          style={{
            width: '52vw',
            height: '52vw',
            top: '-12vw',
            left: '-8vw',
            background: 'radial-gradient(circle, rgba(255, 143, 176, 0.55), transparent 65%)',
          }}
        />
        <div
          className="aurora-blob animate-aurora-2"
          style={{
            width: '46vw',
            height: '46vw',
            bottom: '-14vw',
            right: '-6vw',
            background: 'radial-gradient(circle, rgba(255, 207, 158, 0.4), transparent 65%)',
          }}
        />
        <div
          className="aurora-blob animate-aurora-3"
          style={{
            width: '38vw',
            height: '38vw',
            top: '30%',
            left: '55%',
            opacity: 0.35,
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45), transparent 65%)',
          }}
        />
      </div>

      {/* Cinematic scrim for legibility + depth */}
      <div className="absolute inset-0 pointer-events-none bg-scrim" />
    </div>
  );
}

function getRandomNextIndex(currentIndex: number, length: number) {
  if (length <= 1) return 0;

  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }

  return nextIndex;
}
