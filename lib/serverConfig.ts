import { promises as fs } from 'fs';
import { CountdownConfig, DEFAULT_CONFIG } from './config';
import { CONFIG_FILE, STORAGE_DIR, ensureStorageReady } from './serverStorage';

function normalizeConfig(config: Partial<CountdownConfig>): CountdownConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    backgroundImages: Array.isArray(config.backgroundImages)
      ? config.backgroundImages
          .filter((url): url is string => typeof url === 'string')
          .map(normalizeImageUrl)
      : DEFAULT_CONFIG.backgroundImages,
    backgroundIntervalMs:
      typeof config.backgroundIntervalMs === 'number'
        ? Math.max(2000, config.backgroundIntervalMs)
        : DEFAULT_CONFIG.backgroundIntervalMs,
  };
}

function normalizeImageUrl(url: string): string {
  if (url.startsWith('/uploads/')) {
    return `/api/uploads/${url.split('/').pop()}`;
  }

  return url;
}

export async function readServerConfig(): Promise<CountdownConfig> {
  try {
    await ensureStorageReady();
    const raw = await fs.readFile(CONFIG_FILE, 'utf8');
    return normalizeConfig(JSON.parse(raw) as Partial<CountdownConfig>);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function writeServerConfig(config: Partial<CountdownConfig>): Promise<CountdownConfig> {
  const normalized = normalizeConfig(config);
  await ensureStorageReady();
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}
