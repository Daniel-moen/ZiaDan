import { NextResponse } from 'next/server';
import { readServerConfig, writeServerConfig } from '@/lib/serverConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await readServerConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  try {
    const config = await request.json();
    const saved = await writeServerConfig(config);
    return NextResponse.json(saved);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Could not save countdown settings.',
      },
      { status: 400 },
    );
  }
}
