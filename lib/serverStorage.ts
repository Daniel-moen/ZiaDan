import { constants, promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const STORAGE_ENV = 'ZIA_DAN_STORAGE_DIR';

export const STORAGE_DIR = path.resolve(
  process.env[STORAGE_ENV] || path.join(os.homedir(), '.zia-dan'),
);
export const CONFIG_FILE = path.join(STORAGE_DIR, 'config.json');
export const UPLOAD_DIR = path.join(STORAGE_DIR, 'uploads');

export const LEGACY_DATA_DIR = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  'data',
);
export const LEGACY_CONFIG_FILE = path.join(LEGACY_DATA_DIR, 'config.json');
export const LEGACY_UPLOAD_DIR = path.join(LEGACY_DATA_DIR, 'uploads');
export const LEGACY_PUBLIC_UPLOAD_DIR = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  'public',
  'uploads',
);

let storageReadyPromise: Promise<void> | null = null;

export function ensureStorageReady(): Promise<void> {
  storageReadyPromise ??= prepareStorage();
  return storageReadyPromise;
}

async function prepareStorage() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await copyLegacyConfigIfNeeded();
  await copyLegacyUploadsIfNeeded();
}

async function copyLegacyConfigIfNeeded() {
  if (await exists(CONFIG_FILE)) return;
  if (!(await exists(LEGACY_CONFIG_FILE))) return;

  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.copyFile(LEGACY_CONFIG_FILE, CONFIG_FILE);
}

async function copyLegacyUploadsIfNeeded() {
  await copyDirectoryIfExists(LEGACY_UPLOAD_DIR, UPLOAD_DIR);
  await copyDirectoryIfExists(LEGACY_PUBLIC_UPLOAD_DIR, UPLOAD_DIR);
}

async function copyDirectoryIfExists(source: string, destination: string) {
  let entries;
  try {
    entries = await fs.readdir(source, { withFileTypes: true });
  } catch {
    return;
  }

  await fs.mkdir(destination, { recursive: true });

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        await copyDirectoryIfExists(sourcePath, destinationPath);
        return;
      }

      if (!entry.isFile()) return;

      try {
        await fs.copyFile(sourcePath, destinationPath, constants.COPYFILE_EXCL);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
      }
    }),
  );
}

async function exists(filepath: string) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}
