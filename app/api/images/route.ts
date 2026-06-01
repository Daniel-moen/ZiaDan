import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MIME_EXTENSIONS: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images').filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No images were uploaded.' }, { status: 400 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const urls = await Promise.all(
      files.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files can be uploaded.');
        }

        const ext = MIME_EXTENSIONS[file.type] ?? 'jpg';
        const filename = `${Date.now()}-${randomUUID()}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        const bytes = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filepath, bytes);
        return `/uploads/${filename}`;
      }),
    );

    return NextResponse.json({ urls });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Could not upload those images.',
      },
      { status: 400 },
    );
  }
}
