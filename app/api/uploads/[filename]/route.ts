import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import {
  LEGACY_PUBLIC_UPLOAD_DIR,
  LEGACY_UPLOAD_DIR,
  UPLOAD_DIR,
  ensureStorageReady,
} from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

const CONTENT_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (!filename || filename !== path.basename(filename)) {
    return NextResponse.json({ error: 'Invalid image path.' }, { status: 400 });
  }

  try {
    await ensureStorageReady();
    const filepath = await findUploadPath(filename);
    const file = await fs.readFile(filepath);
    const ext = path.extname(filename).slice(1).toLowerCase();

    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': CONTENT_TYPES[ext] ?? 'application/octet-stream',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  }
}

async function findUploadPath(filename: string): Promise<string> {
  const paths = [
    path.join(UPLOAD_DIR, filename),
    path.join(LEGACY_UPLOAD_DIR, filename),
    path.join(LEGACY_PUBLIC_UPLOAD_DIR, filename),
  ];

  for (const filepath of paths) {
    try {
      await fs.access(filepath);
      return filepath;
    } catch {
      // Try the next location.
    }
  }

  return paths[0];
}
