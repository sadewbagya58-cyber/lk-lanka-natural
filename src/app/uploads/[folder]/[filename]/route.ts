import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ folder: string; filename: string }> }
) {
  const { folder, filename } = await params;

  try {
    // 1. Fetch file from hostinger database
    const dbFile = await prisma.uploadedFile.findUnique({
      where: { filename },
    });

    if (!dbFile) {
      console.warn(`[ImageServing] File not found in database: ${filename}`);
      return new NextResponse('File Not Found', { status: 404 });
    }

    // 2. Ensure local folder exists and save file as a local disk cache
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, dbFile.data);
        console.info(`[ImageServing] Cached file to disk: ${filePath}`);
      }
    } catch (fsErr) {
      console.error('[ImageServing] Disk caching failed:', fsErr);
    }

    // 3. Return file with appropriate content-type and browser cache settings
    return new NextResponse(dbFile.data, {
      status: 200,
      headers: {
        'Content-Type': dbFile.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error(`[ImageServing] Error loading file ${filename}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
