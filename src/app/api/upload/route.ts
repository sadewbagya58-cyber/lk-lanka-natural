import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { verifyAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminSession();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate mime type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Allowed formats: JPG, PNG, WEBP, GIF, SVG' },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 5MB' }, { status: 400 });
    }

    // Sanitize folder path
    const sanitizedFolder = folder.replace(/[^a-z0-9_-]/gi, '');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', sanitizedFolder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = path.extname(file.name) || `.${file.type.split('/')[1] || 'webp'}`;
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${sanitizedFolder}/${filename}`;

    return NextResponse.json({ url: publicUrl, filename }, { status: 201 });
  } catch (error: unknown) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}
