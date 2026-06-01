'use client';

import { useEffect, useState } from 'react';

/**
 * Returns `true` only after the component has mounted on the client.
 * Use this to gate any rendering whose output would differ between the
 * server and the client (random values, dates formatted in the user's
 * locale, time-based UI, etc.) so React's hydration matches exactly.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
