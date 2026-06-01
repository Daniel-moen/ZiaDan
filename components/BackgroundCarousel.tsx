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
      setIndex((i) => (i + 1) % safeImages.length);
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
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.0 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-70 md:hidden"
              style={{
                backgroundImage: `url(${JSON.stringify(current)})`,
                filter: 'saturate(115%) contrast(105%)',
              }}
            />
            <div
              className="background-carousel-image absolute inset-0"
              style={{
                backgroundImage: `url(${JSON.stringify(current)})`,
                filter: 'saturate(115%) contrast(105%)',
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Subtle Ken-Burns drift */}
      <div className="absolute inset-0 pointer-events-none aurora" />
      <div className="absolute inset-0 pointer-events-none vignette" />
    </div>
  );
}
