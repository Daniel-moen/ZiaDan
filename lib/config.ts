// Shared config types + localStorage helpers for the countdown.

export type CountdownConfig = {
  // Headline / identity
  title: string;
  subtitle: string;
  herName: string;
  hisName: string;

  // Primary countdown: the next time we reunite
  reunionDate: string; // ISO string
  reunionLabel: string;

  // Optional "flyby" window — a range of dates within which she might fly down
  flybyEnabled: boolean;
  flybyStart: string; // ISO string
  flybyEnd: string;   // ISO string
  flybyLabel: string;

  // Closing love note shown beneath the countdown
  message: string;

  // Background image URLs (rotate slowly behind the glass card)
  backgroundImages: string[];

  // Rotation interval (ms) for the background carousel
  backgroundIntervalMs: number;

  // Admin password (very light protection — client-side only)
  adminPassword: string;
};

export const STORAGE_KEY = 'zia-dan-countdown:v1';

const isoInDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
};

export const DEFAULT_CONFIG: CountdownConfig = {
  title: 'Until I hold you again',
  subtitle: 'Every second is a step closer to you.',
  herName: 'Zia',
  hisName: 'Dan',
  reunionDate: isoInDays(45),
  reunionLabel: 'Reunion',
  flybyEnabled: true,
  flybyStart: isoInDays(20),
  flybyEnd: isoInDays(34),
  flybyLabel: 'Possible flyby window',
  message:
    'No distance is too far, no ocean too wide. My heart has already booked the ticket.',
  backgroundImages: [
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=2400&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80',
    'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=2400&q=80',
    'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&w=2400&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=2400&q=80',
  ],
  backgroundIntervalMs: 9000,
  adminPassword: 'ziadan',
};

export function loadConfig(): CountdownConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<CountdownConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function cacheConfig(config: CountdownConfig): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Broadcast so the home page picks up changes live.
  window.dispatchEvent(new CustomEvent('ziadan:config', { detail: config }));
}

export async function fetchConfig(): Promise<CountdownConfig> {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (!res.ok) throw new Error('Config request failed.');
    const config = (await res.json()) as CountdownConfig;
    cacheConfig(config);
    return config;
  } catch {
    return loadConfig();
  }
}

export async function saveConfig(config: CountdownConfig): Promise<void> {
  if (typeof window === 'undefined') return;
  const res = await fetch('/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    let message = 'Server save failed.';
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Keep the generic message.
    }
    throw new Error(message);
  }

  const saved = (await res.json()) as CountdownConfig;
  cacheConfig(saved);
}

export type TimeParts = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

export function diffToParts(target: Date | string, now: Date = new Date()): TimeParts {
  const targetDate = typeof target === 'string' ? new Date(target) : target;
  const totalMs = targetDate.getTime() - now.getTime();
  const abs = Math.max(0, totalMs);
  const days = Math.floor(abs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((abs / (1000 * 60)) % 60);
  const seconds = Math.floor((abs / 1000) % 60);
  return { totalMs, days, hours, minutes, seconds, isPast: totalMs <= 0 };
}

export function formatLongDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatShortDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// Convert ISO -> value usable by <input type="datetime-local">
export function isoToLocalInput(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function localInputToIso(value: string): string {
  if (!value) return '';
  // Treat the input as local time.
  return new Date(value).toISOString();
}
