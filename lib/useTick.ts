'use client';

import { useEffect, useState } from 'react';

/** Returns a Date that updates every `intervalMs` ms (default: 1s). */
export function useTick(intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
