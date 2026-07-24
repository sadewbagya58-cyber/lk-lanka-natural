import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No reference photo uploaded.' }, { status: 400 });
    }

    // Validate image format
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file format. Allowed formats: JPG, JPEG, PNG, WEBP.' },
        { status: 400 }
      );
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 10MB.' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'custom-portraits');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || `.${file.type.split('/')[1] || 'webp'}`;
    const filename = `portrait_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/custom-portraits/${filename}`;

    return NextResponse.json({ url: publicUrl, filename }, { status: 201 });
  } catch (error: unknown) {
    console.error('Customer reference photo upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload reference photo' },
      { status: 500 }
    );
  }
}
