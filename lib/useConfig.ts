'use client';

import { useEffect, useState } from 'react';
import {
  CountdownConfig,
  DEFAULT_CONFIG,
  fetchConfig,
  loadConfig,
  STORAGE_KEY,
} from './config';

/**
 * Loads the config from localStorage and keeps it live in sync.
 * Updates when `saveConfig` is called in this tab, and when localStorage
 * changes in other tabs.
 */
export function useConfig(): [CountdownConfig, boolean] {
  const [config, setConfig] = useState<CountdownConfig>(DEFAULT_CONFIG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setConfig(loadConfig());
    setReady(true);
    fetchConfig().then((serverConfig) => {
      if (!cancelled) setConfig(serverConfig);
    });

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<CountdownConfig>).detail;
      if (detail) setConfig(detail);
      else setConfig(loadConfig());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setConfig(loadConfig());
    };

    window.addEventListener('ziadan:config', onCustom as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('ziadan:config', onCustom as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return [config, ready];
}
