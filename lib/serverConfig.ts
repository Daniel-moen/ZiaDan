import { promises as fs } from 'fs';
import path from 'path';
import { CountdownConfig, DEFAULT_CONFIG } from './config';

const DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

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
    const raw = await fs.readFile(CONFIG_FILE, 'utf8');
    return normalizeConfig(JSON.parse(raw) as Partial<CountdownConfig>);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function writeServerConfig(config: Partial<CountdownConfig>): Promise<CountdownConfig> {
  const normalized = normalizeConfig(config);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}
